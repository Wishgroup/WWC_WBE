/**
 * NFC Validation API Routes
 * For vendor POS systems
 */

import express from 'express';
import { authenticateVendor, authenticatePOSDevice } from '../middleware/auth.js';
import { nfcValidationLimiter } from '../middleware/rateLimiter.js';
import NFCValidationPipeline from '../services/NFCValidationPipeline.js';
import { logAudit } from '../services/AuditService.js';
import { query } from '../database/connection.js';
import { enqueueNotification } from '../services/NotificationService.js';

const router = express.Router();

/**
 * POST /api/nfc/validate
 * Fast NFC validation endpoint (no notifications)
 * Supports both vendor API key and POS device auth (Phase 4)
 * Supports both UID-based and signature-based validation (Phase 3)
 */
router.post(
  '/validate',
  nfcValidationLimiter,
  async (req, res, next) => {
    // Try POS device auth first, fall back to vendor API key
    const hasDeviceAuth = req.headers['x-pos-reader-id'] && req.headers['x-pos-device-key'];
    
    if (hasDeviceAuth) {
      return authenticatePOSDevice(req, res, next);
    } else {
      return authenticateVendor(req, res, next);
    }
  },
  async (req, res) => {
    try {
      const {
        cardUid, // Legacy: UID-based
        cardPublicId, // Phase 3: Public ID-based
        payload, // Phase 3: Payload from card
        signature, // Phase 3: Signature from card
        posReaderId,
        latitude,
        longitude,
        transactionAmount,
      } = req.body;

      // Get vendor ID from auth (either device auth or vendor API key)
      const vendorId = req.vendor?.id || req.posReader?.vendor_id;

      if (!vendorId) {
        return res.status(401).json({ 
          success: false,
          error: 'Vendor authentication required' 
        });
      }

      // Use posReaderId from device auth if available, otherwise from body
      const readerId = req.posReader?.reader_id || posReaderId;

      if (!readerId) {
        return res.status(400).json({ 
          success: false,
          error: 'posReaderId is required' 
        });
      }

      // Validate NFC tap (supports both UID and signature-based)
      const validationResult = await NFCValidationPipeline.validateNFCTap({
        cardUid,
        cardPublicId,
        payload,
        signature,
        vendorId,
        posReaderId: readerId,
        latitude,
        longitude,
        transactionAmount,
      });

      // Log API call
      await logAudit({
        userType: 'api',
        action: 'nfc_validation_request',
        resourceType: 'nfc_tap',
        details: {
          vendorId,
          cardUid: cardUid || cardPublicId,
          approved: validationResult.approved,
          validationType: 'validate',
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      if (validationResult.approved) {
        return res.status(200).json({
          success: true,
          approved: true,
          memberId: validationResult.memberId,
          membershipType: validationResult.membershipType,
          offer: validationResult.offer,
          currency: validationResult.currency,
          timestamp: validationResult.timestamp,
        });
      } else {
        return res.status(200).json({
          success: false,
          approved: false,
          reason: validationResult.reason,
          fraudScore: validationResult.fraudScore || 0,
        });
      }
    } catch (error) {
      console.error('NFC validation API error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/nfc/redeem
 * Commit redemption (Phase 4)
 * Requires POS device authentication
 * Idempotent via (vendor_id, invoice_id) unique constraint
 * Enqueues notifications on success
 */
router.post(
  '/redeem',
  authenticatePOSDevice,
  nfcValidationLimiter,
  async (req, res) => {
    try {
      const {
        cardUid,
        cardPublicId,
        payload,
        signature,
        invoiceId,
        amount,
        discountAmount = 0,
        offerApplied = null,
      } = req.body;

      if (!invoiceId) {
        return res.status(400).json({ 
          success: false,
          error: 'invoiceId is required' 
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Valid amount is required' 
        });
      }

      const vendorId = req.vendor.id;
      const posReaderId = req.posReader.reader_id;
      const finalAmount = parseFloat(amount) - parseFloat(discountAmount || 0);

      // Validate card first
      const validationResult = await NFCValidationPipeline.validateNFCTap({
        cardUid,
        cardPublicId,
        payload,
        signature,
        vendorId,
        posReaderId,
      });

      if (!validationResult.approved) {
        return res.status(400).json({
          success: false,
          error: 'Card validation failed',
          reason: validationResult.reason,
        });
      }

      const memberId = validationResult.memberId;

      // Check for existing redemption (idempotency)
      const existingRedemption = await query(
        'SELECT * FROM redemptions WHERE vendor_id = ? AND invoice_id = ?',
        [vendorId, invoiceId]
      );

      if (existingRedemption.rows.length > 0) {
        // Return existing redemption (idempotent)
        const redemption = existingRedemption.rows[0];
        return res.json({
          success: true,
          message: 'Redemption already processed (idempotent)',
          data: {
            redemption_id: redemption.id,
            invoice_id: redemption.invoice_id,
            amount: redemption.amount,
            final_amount: redemption.final_amount,
            redeemed_at: redemption.redeemed_at,
          },
        });
      }

      // Get card info for redemption record
      let cardPublicIdForRecord = cardPublicId;
      let cardUidForRecord = cardUid;

      if (cardPublicId && payload) {
        // New signature-based card
        const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
        cardPublicIdForRecord = payloadObj.card_public_id || cardPublicId;
      }

      // Create redemption record
      const redemptionResult = await query(
        `INSERT INTO redemptions 
         (vendor_id, member_id, card_public_id, card_uid, invoice_id, amount, 
          discount_amount, final_amount, pos_reader_id, offer_applied)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vendorId,
          memberId,
          cardPublicIdForRecord,
          cardUidForRecord,
          invoiceId,
          parseFloat(amount),
          parseFloat(discountAmount || 0),
          finalAmount,
          posReaderId,
          offerApplied ? JSON.stringify(offerApplied) : null,
        ]
      );

      const redemptionId = redemptionResult.rows.insertId;

      // Get member details for notification
      const memberResult = await query(
        'SELECT email, full_name, mobile_number FROM members WHERE id = ?',
        [memberId]
      );
      const member = memberResult.rows[0];

      // Enqueue notifications (Phase 6)
      try {
        await enqueueNotification({
          channel: 'email',
          recipient: member.email,
          template: 'redeem_success',
          data: {
            member_name: member.full_name,
            amount: amount,
            discount_amount: discountAmount || 0,
            final_amount: finalAmount,
            invoice_id: invoiceId,
            vendor_name: req.vendor.vendor_name,
          },
        });

        if (member.mobile_number) {
          await enqueueNotification({
            channel: 'sms',
            recipient: member.mobile_number,
            template: 'redeem_success',
            data: {
              member_name: member.full_name,
              amount: amount,
              final_amount: finalAmount,
              invoice_id: invoiceId,
            },
          });
        }
      } catch (notifError) {
        console.error('Error enqueueing notifications:', notifError);
        // Don't fail redemption if notification fails
      }

      // Log audit
      await logAudit({
        userType: 'api',
        action: 'redemption_committed',
        resourceType: 'redemption',
        resourceId: redemptionId,
        details: {
          vendorId,
          memberId,
          invoiceId,
          amount,
          finalAmount,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        success: true,
        message: 'Redemption committed successfully',
        data: {
          redemption_id: redemptionId,
          invoice_id: invoiceId,
          amount: amount,
          discount_amount: discountAmount || 0,
          final_amount: finalAmount,
          redeemed_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Check if it's a duplicate key error (idempotency)
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
        // Try to get existing redemption
        try {
          const existing = await query(
            'SELECT * FROM redemptions WHERE vendor_id = ? AND invoice_id = ?',
            [req.vendor.id, req.body.invoiceId]
          );
          if (existing.rows.length > 0) {
            const redemption = existing.rows[0];
            return res.json({
              success: true,
              message: 'Redemption already processed (idempotent)',
              data: {
                redemption_id: redemption.id,
                invoice_id: redemption.invoice_id,
                amount: redemption.amount,
                final_amount: redemption.final_amount,
                redeemed_at: redemption.redeemed_at,
              },
            });
          }
        } catch (lookupError) {
          // Fall through to error response
        }
      }

      console.error('NFC redeem API error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
);

export default router;




