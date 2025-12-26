/**
 * Fraud Detection Engine
 * Detects and prevents card sharing, cloning, vendor misuse, and abnormal patterns
 * ML-ready architecture for future anomaly detection
 */

import { query } from '../database/connection.js';
import { createFraudEvent, logAudit } from './AuditService.js';

class FraudDetectionEngine {
  constructor() {
    this.config = {
      maxDistanceKmPerHour: parseInt(process.env.MAX_DISTANCE_KM_PER_HOUR) || 1000,
      maxTapsPerHour: parseInt(process.env.MAX_TAPS_PER_HOUR) || 10,
      maxTapsPerDay: parseInt(process.env.MAX_TAPS_PER_DAY) || 50,
      fraudScoreLow: parseInt(process.env.FRAUD_SCORE_LOW) || 30,
      fraudScoreMedium: parseInt(process.env.FRAUD_SCORE_MEDIUM) || 60,
      fraudScoreHigh: parseInt(process.env.FRAUD_SCORE_HIGH) || 90,
    };
  }

  /**
   * Main fraud detection method - called during NFC validation
   * @param {Object} tapData - NFC tap data
   * @returns {Object} Fraud detection result
   */
  async detectFraud(tapData) {
    const {
      memberId,
      cardUid,
      vendorId,
      vendorCountry,
      vendorCity,
      posReaderId,
      latitude,
      longitude,
      timestamp = new Date(),
    } = tapData;

    let fraudScore = 0;
    const fraudFlags = [];
    let severity = 'low';
    let action = 'logged';

    try {
      // 1. Check card status
      const cardStatusCheck = await this.checkCardStatus(cardUid);
      if (!cardStatusCheck.valid) {
        return {
          valid: false,
          fraudScore: 100,
          fraudFlags: [cardStatusCheck.reason],
          severity: 'high',
          action: 'rejected',
          reason: cardStatusCheck.reason,
        };
      }

      // 2. Check member status
      const memberStatusCheck = await this.checkMemberStatus(memberId);
      if (!memberStatusCheck.valid) {
        return {
          valid: false,
          fraudScore: 100,
          fraudFlags: [memberStatusCheck.reason],
          severity: 'high',
          action: 'rejected',
          reason: memberStatusCheck.reason,
        };
      }

      // 3. Geo-location inconsistency check
      const geoCheck = await this.checkGeoLocationInconsistency(
        cardUid,
        vendorCountry,
        vendorCity,
        latitude,
        longitude,
        timestamp
      );
      if (geoCheck.flag) {
        fraudScore += geoCheck.score;
        fraudFlags.push(...geoCheck.flags);
      }

      // 4. Excessive tap frequency check
      const frequencyCheck = await this.checkTapFrequency(
        cardUid,
        timestamp
      );
      if (frequencyCheck.flag) {
        fraudScore += frequencyCheck.score;
        fraudFlags.push(...frequencyCheck.flags);
      }

      // 5. Country mismatch check
      const countryCheck = await this.checkCountryMismatch(
        memberId,
        vendorCountry
      );
      if (countryCheck.flag) {
        fraudScore += countryCheck.score;
        fraudFlags.push(...countryCheck.flags);
      }

      // 6. Expired/blocked card access attempt
      const expiredCheck = await this.checkExpiredAccess(
        memberId,
        cardUid
      );
      if (expiredCheck.flag) {
        fraudScore += expiredCheck.score;
        fraudFlags.push(...expiredCheck.flags);
      }

      // 7. Cloning attempt detection (same UID, different locations simultaneously)
      const cloningCheck = await this.checkCloningAttempt(
        cardUid,
        vendorCountry,
        vendorCity,
        timestamp
      );
      if (cloningCheck.flag) {
        fraudScore += cloningCheck.score;
        fraudFlags.push(...cloningCheck.flags);
        severity = 'high';
      }

      // Determine severity and action based on fraud score
      if (fraudScore >= this.config.fraudScoreHigh) {
        severity = 'high';
        action = 'block_card';
      } else if (fraudScore >= this.config.fraudScoreMedium) {
        severity = 'medium';
        action = 'soft_restriction';
      } else if (fraudScore >= this.config.fraudScoreLow) {
        severity = 'low';
        action = 'logged';
      }

      // Update member fraud score
      await this.updateMemberFraudScore(memberId, fraudScore, severity);

      // Create fraud event if score > 0
      if (fraudScore > 0) {
        await createFraudEvent({
          memberId,
          cardUid,
          vendorId,
          eventType: this.determineEventType(fraudFlags),
          severity,
          fraudScore,
          description: `Fraud detected: ${fraudFlags.join(', ')}`,
          metadata: {
            vendorCountry,
            vendorCity,
            posReaderId,
            latitude,
            longitude,
          },
          actionTaken: action,
        });
      }

      return {
        valid: action !== 'block_card',
        fraudScore,
        fraudFlags,
        severity,
        action,
        reason: fraudFlags.length > 0 ? fraudFlags.join(', ') : null,
      };
    } catch (error) {
      console.error('Fraud detection error:', error);
      // On error, allow the transaction but log it
      return {
        valid: true,
        fraudScore: 0,
        fraudFlags: [],
        severity: 'low',
        action: 'logged',
        error: error.message,
      };
    }
  }

  /**
   * Check if card status is valid
   */
  async checkCardStatus(cardUid) {
    const result = await query(
      `SELECT card_status, expiry_date, blocked_at 
       FROM nfc_cards 
       WHERE card_uid = $1`,
      [cardUid]
    );

    if (result.rows.length === 0) {
      return { valid: false, reason: 'card_not_found' };
    }

    const card = result.rows[0];

    if (card.card_status === 'blacklisted') {
      return { valid: false, reason: 'card_blacklisted' };
    }

    if (card.card_status === 'blocked') {
      return { valid: false, reason: 'card_blocked' };
    }

    if (card.card_status === 'lost' || card.card_status === 'stolen') {
      return { valid: false, reason: `card_${card.card_status}` };
    }

    if (card.expiry_date && new Date(card.expiry_date) < new Date()) {
      return { valid: false, reason: 'card_expired' };
    }

    return { valid: true };
  }

  /**
   * Check if member status is valid
   */
  async checkMemberStatus(memberId) {
    const result = await query(
      `SELECT membership_status, fraud_status, subscription_end_date 
       FROM members 
       WHERE id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return { valid: false, reason: 'member_not_found' };
    }

    const member = result.rows[0];

    if (member.membership_status === 'suspended' || member.membership_status === 'cancelled') {
      return { valid: false, reason: `membership_${member.membership_status}` };
    }

    if (member.fraud_status === 'blocked') {
      return { valid: false, reason: 'member_blocked' };
    }

    if (member.subscription_end_date && new Date(member.subscription_end_date) < new Date()) {
      return { valid: false, reason: 'membership_expired' };
    }

    return { valid: true };
  }

  /**
   * Check for geo-location inconsistencies
   */
  async checkGeoLocationInconsistency(cardUid, vendorCountry, vendorCity, latitude, longitude, timestamp) {
    // Get recent taps for this card (last hour)
    const oneHourAgo = new Date(timestamp.getTime() - 60 * 60 * 1000);
    
    const recentTaps = await query(
      `SELECT vendor_country, vendor_city, latitude, longitude, tap_timestamp 
       FROM nfc_tap_logs 
       WHERE card_uid = $1 
       AND tap_timestamp > $2 
       ORDER BY tap_timestamp DESC 
       LIMIT 10`,
      [cardUid, oneHourAgo]
    );

    if (recentTaps.rows.length === 0) {
      return { flag: false, score: 0, flags: [] };
    }

    const flags = [];
    let score = 0;

    for (const tap of recentTaps.rows) {
      // Check if same card used in different countries within short time
      if (tap.vendor_country !== vendorCountry) {
        const timeDiff = Math.abs(new Date(tap.tap_timestamp) - timestamp) / (1000 * 60); // minutes
        
        if (timeDiff < 60) { // Less than 60 minutes
          const distance = this.calculateDistance(
            tap.latitude,
            tap.longitude,
            latitude,
            longitude
          );

          if (distance > this.config.maxDistanceKmPerHour) {
            flags.push('geo_inconsistency');
            score += 40;
          }
        }
      }
    }

    return { flag: flags.length > 0, score, flags };
  }

  /**
   * Check for excessive tap frequency
   */
  async checkTapFrequency(cardUid, timestamp) {
    const oneHourAgo = new Date(timestamp.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);

    const hourlyTaps = await query(
      `SELECT COUNT(*) as count 
       FROM nfc_tap_logs 
       WHERE card_uid = $1 
       AND tap_timestamp > $2`,
      [cardUid, oneHourAgo]
    );

    const dailyTaps = await query(
      `SELECT COUNT(*) as count 
       FROM nfc_tap_logs 
       WHERE card_uid = $1 
       AND tap_timestamp > $2`,
      [cardUid, oneDayAgo]
    );

    const hourlyCount = parseInt(hourlyTaps.rows[0].count);
    const dailyCount = parseInt(dailyTaps.rows[0].count);

    const flags = [];
    let score = 0;

    if (hourlyCount >= this.config.maxTapsPerHour) {
      flags.push('excessive_hourly_taps');
      score += 30;
    }

    if (dailyCount >= this.config.maxTapsPerDay) {
      flags.push('excessive_daily_taps');
      score += 20;
    }

    return { flag: flags.length > 0, score, flags };
  }

  /**
   * Check for country mismatch (member country vs vendor country)
   */
  async checkCountryMismatch(memberId, vendorCountry) {
    const member = await query(
      `SELECT country FROM members WHERE id = $1`,
      [memberId]
    );

    if (member.rows.length === 0) {
      return { flag: false, score: 0, flags: [] };
    }

    const memberCountry = member.rows[0].country;

    // Allow if member country matches or is null (not set)
    if (!memberCountry || memberCountry === vendorCountry) {
      return { flag: false, score: 0, flags: [] };
    }

    // This is a soft flag - might be legitimate travel
    return { flag: true, score: 10, flags: ['country_mismatch'] };
  }

  /**
   * Check for expired/blocked card access attempts
   */
  async checkExpiredAccess(memberId, cardUid) {
    const card = await query(
      `SELECT expiry_date, blocked_at, card_status 
       FROM nfc_cards 
       WHERE card_uid = $1 AND member_id = $2`,
      [cardUid, memberId]
    );

    if (card.rows.length === 0) {
      return { flag: true, score: 50, flags: ['card_not_linked_to_member'] };
    }

    const cardData = card.rows[0];

    if (cardData.expiry_date && new Date(cardData.expiry_date) < new Date()) {
      return { flag: true, score: 50, flags: ['expired_card_access'] };
    }

    if (cardData.blocked_at) {
      return { flag: true, score: 50, flags: ['blocked_card_access'] };
    }

    return { flag: false, score: 0, flags: [] };
  }

  /**
   * Check for cloning attempts (same UID in different locations simultaneously)
   */
  async checkCloningAttempt(cardUid, vendorCountry, vendorCity, timestamp) {
    // Check for taps within 5 minutes in different locations
    const fiveMinutesAgo = new Date(timestamp.getTime() - 5 * 60 * 1000);
    
    const recentTaps = await query(
      `SELECT vendor_country, vendor_city, latitude, longitude 
       FROM nfc_tap_logs 
       WHERE card_uid = $1 
       AND tap_timestamp > $2 
       AND (vendor_country != $3 OR vendor_city != $4)`,
      [cardUid, fiveMinutesAgo, vendorCountry, vendorCity]
    );

    if (recentTaps.rows.length > 0) {
      return { flag: true, score: 80, flags: ['possible_cloning_attempt'] };
    }

    return { flag: false, score: 0, flags: [] };
  }

  /**
   * Update member fraud score
   */
  async updateMemberFraudScore(memberId, fraudScore, severity) {
    let fraudStatus = 'clean';
    
    if (severity === 'high') {
      fraudStatus = 'blocked';
    } else if (severity === 'medium') {
      fraudStatus = 'restricted';
    } else if (severity === 'low' && fraudScore > 0) {
      fraudStatus = 'monitored';
    }

    await query(
      `UPDATE members 
       SET fraud_score = $1, 
           fraud_status = $2, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [fraudScore, fraudStatus, memberId]
    );
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Determine event type from fraud flags
   */
  determineEventType(flags) {
    if (flags.includes('possible_cloning_attempt')) {
      return 'cloning_attempt';
    }
    if (flags.includes('geo_inconsistency')) {
      return 'geo_inconsistency';
    }
    if (flags.includes('excessive_hourly_taps') || flags.includes('excessive_daily_taps')) {
      return 'excessive_taps';
    }
    if (flags.includes('country_mismatch')) {
      return 'country_mismatch';
    }
    if (flags.includes('expired_card_access') || flags.includes('blocked_card_access')) {
      return 'expired_access';
    }
    return 'suspicious_activity';
  }
}

export default new FraudDetectionEngine();





