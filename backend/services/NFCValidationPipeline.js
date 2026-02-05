/**
 * Mandatory NFC Validation Pipeline
 * Strict order enforcement:
 * 1. Card UID Validation
 * 2. Card Status Check
 * 3. Fraud Detection
 * 4. Country Rule Validation
 * 5. Dynamic Offer Calculation
 * 6. Response to Vendor POS
 */

import { query } from '../database/connection.js';
import FraudDetectionEngine from './FraudDetectionEngine.js';
import CountryRuleEngine from './CountryRuleEngine.js';
import OfferEngine from './OfferEngine.js';
import { logAudit } from './AuditService.js';
import NFCCardService from './NFCCardService.js';

class NFCValidationPipeline {
  /**
   * Main validation pipeline - called by vendor POS
   * @param {Object} tapRequest - NFC tap data from POS
   * @returns {Object} Validation response
   */
  async validateNFCTap(tapRequest) {
    const {
      cardUid, // Legacy: UID-based validation
      cardPublicId, // New: Public ID-based validation (Phase 3)
      payload, // New: Payload from card (Phase 3)
      signature, // New: Signature from card (Phase 3)
      vendorId,
      posReaderId,
      latitude,
      longitude,
      transactionAmount, // Optional: for offer calculation
    } = tapRequest;

    const timestamp = new Date();
    let validationResult = {
      approved: false,
      reason: null,
      memberId: null,
      membershipType: null,
      offer: null,
      fraudScore: 0,
      timestamp,
    };

    try {
      // STEP 1: Card Validation (supports both UID and signature-based)
      let cardValidation;
      let cardUidForLogging = cardUid;

      if (cardPublicId && payload && signature) {
        // New signature-based validation (Phase 3)
        cardValidation = await this.validateCardSignature(cardPublicId, payload, signature);
        if (!cardValidation.valid) {
          await this.logTapResult(cardPublicId, vendorId, posReaderId, {
            ...validationResult,
            reason: cardValidation.reason,
          });
          return {
            ...validationResult,
            reason: cardValidation.reason,
          };
        }
        cardUidForLogging = cardValidation.cardData?.card_uid || cardPublicId;
      } else if (cardUid) {
        // Legacy UID-based validation (backward compatibility)
        cardValidation = await this.validateCardUID(cardUid);
        if (!cardValidation.valid) {
          await this.logTapResult(cardUid, vendorId, posReaderId, {
            ...validationResult,
            reason: cardValidation.reason,
          });
          return {
            ...validationResult,
            reason: cardValidation.reason,
          };
        }
      } else {
        return {
          ...validationResult,
          reason: 'card_identifier_required',
        };
      }

      const { memberId, cardData } = cardValidation;

      // STEP 2: Card Status Check (Active / Blocked / Expired)
      const statusCheck = await this.checkCardStatus(cardUidForLogging, memberId, cardData);
      if (!statusCheck.valid) {
        await this.logTapResult(cardUid, vendorId, posReaderId, {
          ...validationResult,
          memberId,
          reason: statusCheck.reason,
        });
        return {
          ...validationResult,
          memberId,
          reason: statusCheck.reason,
        };
      }

      // Get member data
      const member = await query(
        `SELECT id, membership_type, membership_status, fraud_score, fraud_status, 
                subscription_end_date, country
         FROM members 
         WHERE id = ?`,
        [memberId]
      );

      if (member.rows.length === 0) {
        await this.logTapResult(cardUid, vendorId, posReaderId, {
          ...validationResult,
          memberId,
          reason: 'member_not_found',
        });
        return {
          ...validationResult,
          memberId,
          reason: 'member_not_found',
        };
      }

      const memberData = member.rows[0];

      // STEP 3: Fraud Detection
      const fraudResult = await FraudDetectionEngine.detectFraud({
        memberId,
        cardUid,
        vendorId,
        vendorCountry: null, // Will be fetched in fraud detection
        vendorCity: null,
        posReaderId,
        latitude,
        longitude,
        timestamp,
      });

      // Get vendor data for fraud detection
      const vendor = await query(
        `SELECT country, city, category FROM vendors WHERE id = ?`,
        [vendorId]
      );

      if (vendor.rows.length === 0) {
        await this.logTapResult(cardUid, vendorId, posReaderId, {
          ...validationResult,
          memberId,
          reason: 'vendor_not_found',
        });
        return {
          ...validationResult,
          memberId,
          reason: 'vendor_not_found',
        };
      }

      const vendorData = vendor.rows[0];

      // Re-run fraud detection with vendor location
      const fraudResultWithLocation = await FraudDetectionEngine.detectFraud({
        memberId,
        cardUid,
        vendorId,
        vendorCountry: vendorData.country,
        vendorCity: vendorData.city,
        posReaderId,
        latitude,
        longitude,
        timestamp,
      });

      if (!fraudResultWithLocation.valid) {
        await this.logTapResult(cardUid, vendorId, posReaderId, {
          ...validationResult,
          memberId,
          membershipType: memberData.membership_type,
          fraudScore: fraudResultWithLocation.fraudScore,
          reason: fraudResultWithLocation.reason,
        });
        return {
          ...validationResult,
          memberId,
          membershipType: memberData.membership_type,
          fraudScore: fraudResultWithLocation.fraudScore,
          reason: fraudResultWithLocation.reason,
        };
      }

      // STEP 4: Country Rule Validation
      const countryRuleResult = await CountryRuleEngine.validateCountryRules({
        vendorId,
        memberId,
        membershipType: memberData.membership_type,
      });

      if (!countryRuleResult.valid) {
        await this.logTapResult(cardUid, vendorId, posReaderId, {
          ...validationResult,
          memberId,
          membershipType: memberData.membership_type,
          fraudScore: fraudResultWithLocation.fraudScore,
          reason: countryRuleResult.reason,
        });
        return {
          ...validationResult,
          memberId,
          membershipType: memberData.membership_type,
          fraudScore: fraudResultWithLocation.fraudScore,
          reason: countryRuleResult.reason,
        };
      }

      // STEP 5: Dynamic Offer Calculation
      let offer = null;
      if (fraudResultWithLocation.fraudScore < 90 && memberData.fraud_status !== 'blocked') {
        offer = await OfferEngine.calculateBestOffer({
          memberId,
          membershipType: memberData.membership_type,
          vendorId,
          vendorCategory: vendorData.category,
          countryCode: countryRuleResult.countryCode,
          fraudScore: fraudResultWithLocation.fraudScore,
          fraudStatus: memberData.fraud_status,
          maxDiscountPercentage: countryRuleResult.maxDiscountPercentage,
          currentTime: timestamp,
        });
      }

      // STEP 6: Log successful tap
      const tapLogId = await this.logNFCTap({
        memberId,
        cardUid: cardUidForLogging,
        vendorId,
        vendorCountry: vendorData.country,
        vendorCity: vendorData.city,
        posReaderId,
        latitude,
        longitude,
        fraudScore: fraudResultWithLocation.fraudScore,
        fraudFlags: fraudResultWithLocation.fraudFlags,
        validationResult: 'approved',
        offer,
        timestamp,
      });

      // Log offer usage if offer was applied
      if (offer && transactionAmount) {
        const discountAmount = offer.discountAmount || 
          (transactionAmount * (offer.discountPercentage / 100));
        const finalAmount = transactionAmount - discountAmount;

        await OfferEngine.logOfferUsage({
          offerId: offer.offerId,
          memberId,
          vendorId,
          nfcTapLogId: tapLogId,
          discountAmount,
          originalAmount: transactionAmount,
          finalAmount,
        });
      }

      // Audit log
      await logAudit({
        userType: 'system',
        action: 'nfc_tap_validated',
        resourceType: 'nfc_tap',
        resourceId: tapLogId,
        details: {
          memberId,
          cardUid: cardUidForLogging,
          cardPublicId: cardPublicId || null,
          vendorId,
          approved: true,
          offerApplied: offer ? true : false,
        },
      });

      // STEP 7: Response to Vendor POS
      return {
        approved: true,
        memberId,
        membershipType: memberData.membership_type,
        offer,
        fraudScore: fraudResultWithLocation.fraudScore,
        timestamp,
        currency: countryRuleResult.currency,
      };
    } catch (error) {
      console.error('NFC validation pipeline error:', error);
      
      // Log error
      await this.logTapResult(cardUid || cardPublicId || 'unknown', vendorId, posReaderId, {
        ...validationResult,
        reason: 'validation_error',
        error: error.message,
      });

      return {
        ...validationResult,
        reason: 'validation_error',
        error: error.message,
      };
    }
  }

  /**
   * Validate Card UID (Legacy method - backward compatibility)
   */
  async validateCardUID(cardUid) {
    const result = await query(
      `SELECT id, member_id, card_status, encrypted_token, card_public_id
       FROM nfc_cards 
       WHERE card_uid = ?`,
      [cardUid]
    );

    if (result.rows.length === 0) {
      return { valid: false, reason: 'card_uid_not_found' };
    }

    const card = result.rows[0];

    return {
      valid: true,
      memberId: card.member_id,
      cardData: card,
    };
  }

  /**
   * Validate Card Signature (Phase 3 - New method)
   */
  async validateCardSignature(cardPublicId, payload, signature) {
    try {
      // Get card from database
      const card = await NFCCardService.getCardByPublicId(cardPublicId);

      if (!card) {
        return { valid: false, reason: 'card_public_id_not_found' };
      }

      // Verify signature
      const isValid = await NFCCardService.verifyCardSignature(
        cardPublicId,
        payload,
        signature
      );

      if (!isValid) {
        return { valid: false, reason: 'invalid_signature' };
      }

      // Check if payload matches stored payload (optional additional check)
      if (card.payload) {
        const storedPayload = JSON.parse(card.payload);
        // Verify key fields match
        if (storedPayload.member_public_id !== payload.member_public_id ||
            storedPayload.card_public_id !== payload.card_public_id) {
          return { valid: false, reason: 'payload_mismatch' };
        }
      }

      return {
        valid: true,
        memberId: card.member_id,
        cardData: card,
      };
    } catch (error) {
      console.error('Card signature validation error:', error);
      return { valid: false, reason: 'validation_error', error: error.message };
    }
  }

  /**
   * Check card status
   * Supports both UID-based (legacy) and cardData-based (Phase 3) checks
   */
  async checkCardStatus(cardUid, memberId, cardData = null) {
    // If cardData is provided (from signature validation), use it
    if (cardData) {
      if (cardData.card_status !== 'active') {
        return { valid: false, reason: `card_${cardData.card_status}` };
      }

      // Check expiration from payload if available
      if (cardData.payload) {
        try {
          const payload = JSON.parse(cardData.payload);
          if (payload.expires_at) {
            const expiresAt = new Date(payload.expires_at);
            if (expiresAt < new Date()) {
              return { valid: false, reason: 'card_expired' };
            }
          }
        } catch (error) {
          // If payload parsing fails, fall back to database expiry_date
        }
      }

      // Check database expiry_date as fallback
      if (cardData.expiry_date && new Date(cardData.expiry_date) < new Date()) {
        return { valid: false, reason: 'card_expired' };
      }

      if (cardData.blocked_at) {
        return { valid: false, reason: 'card_blocked' };
      }

      return { valid: true };
    }

    // Legacy: Query database by UID
    const result = await query(
      `SELECT card_status, expiry_date, blocked_at, expires_at
       FROM nfc_cards 
       WHERE card_uid = ? AND member_id = ?`,
      [cardUid, memberId]
    );

    if (result.rows.length === 0) {
      return { valid: false, reason: 'card_not_linked_to_member' };
    }

    const card = result.rows[0];

    if (card.card_status !== 'active') {
      return { valid: false, reason: `card_${card.card_status}` };
    }

    if (card.expiry_date && new Date(card.expiry_date) < new Date()) {
      return { valid: false, reason: 'card_expired' };
    }

    if (card.blocked_at) {
      return { valid: false, reason: 'card_blocked' };
    }

    return { valid: true };
  }

  /**
   * Log NFC tap
   */
  async logNFCTap(tapData) {
    const result = await query(
      `INSERT INTO nfc_tap_logs 
       (member_id, card_uid, vendor_id, vendor_country, vendor_city, 
        pos_reader_id, tap_timestamp, latitude, longitude, fraud_score, 
        fraud_flags, validation_result, offer_applied)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tapData.memberId,
        tapData.cardUid,
        tapData.vendorId,
        tapData.vendorCountry,
        tapData.vendorCity,
        tapData.posReaderId,
        tapData.timestamp,
        tapData.latitude,
        tapData.longitude,
        tapData.fraudScore,
        tapData.fraudFlags || [],
        tapData.validationResult,
        tapData.offer ? JSON.stringify(tapData.offer) : null,
      ]
    );

    return result.rows.insertId;
  }

  /**
   * Log tap result (for rejected taps)
   */
  async logTapResult(cardUid, vendorId, posReaderId, result) {
    try {
      await query(
        `INSERT INTO nfc_tap_logs 
         (card_uid, vendor_id, pos_reader_id, tap_timestamp, validation_result, fraud_score)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          cardUid,
          vendorId,
          posReaderId,
          result.timestamp,
          'rejected',
          result.fraudScore || 0,
        ]
      );
    } catch (error) {
      console.error('Error logging tap result:', error);
    }
  }
}

export default new NFCValidationPipeline();





