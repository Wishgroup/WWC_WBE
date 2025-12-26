/**
 * Dynamic Offers Engine
 * Calculates real-time personalized offers at NFC tap time
 * Respects country rules, membership eligibility, vendor restrictions, and fraud status
 */

import { query } from '../database/connection.js';

class OfferEngine {
  constructor() {
    this.offerCache = new Map();
    this.cacheExpiry = 2 * 60 * 1000; // 2 minutes
  }

  /**
   * Calculate the best eligible offer for a member at a vendor
   * Returns only ONE best offer
   * @param {Object} offerData
   * @returns {Object} Best offer or null
   */
  async calculateBestOffer(offerData) {
    const {
      memberId,
      membershipType,
      vendorId,
      vendorCategory,
      countryCode,
      fraudScore,
      fraudStatus,
      maxDiscountPercentage, // From country rules
      currentTime = new Date(),
    } = offerData;

    try {
      // Don't offer discounts to blocked members
      if (fraudStatus === 'blocked' || fraudScore >= 90) {
        return null;
      }

      // Get member usage history
      const usageHistory = await this.getMemberUsageHistory(memberId);

      // Get all active offers that could apply
      const eligibleOffers = await this.getEligibleOffers({
        membershipType,
        vendorCategory,
        countryCode,
        currentTime,
      });

      if (eligibleOffers.length === 0) {
        return null;
      }

      // Score and rank offers
      const scoredOffers = eligibleOffers
        .map(offer => this.scoreOffer(offer, usageHistory, maxDiscountPercentage))
        .filter(offer => offer.eligible) // Filter out ineligible
        .sort((a, b) => b.priority - a.priority); // Sort by priority

      if (scoredOffers.length === 0) {
        return null;
      }

      // Return the best offer
      const bestOffer = scoredOffers[0].offer;
      
      // Calculate final discount amount
      const discountDetails = this.calculateDiscount(bestOffer, maxDiscountPercentage);

      return {
        offerId: bestOffer.id,
        offerCode: bestOffer.offer_code,
        offerType: bestOffer.offer_type,
        discountPercentage: discountDetails.discountPercentage,
        discountAmount: discountDetails.discountAmount,
        minPurchaseAmount: parseFloat(bestOffer.min_purchase_amount || 0),
        maxDiscountAmount: parseFloat(bestOffer.max_discount_amount || null),
        validUntil: bestOffer.valid_until,
        conditions: bestOffer.conditions || {},
      };
    } catch (error) {
      console.error('Offer calculation error:', error);
      return null; // Fail gracefully - no offer rather than error
    }
  }

  /**
   * Get eligible offers from database
   */
  async getEligibleOffers(filters) {
    const {
      membershipType,
      vendorCategory,
      countryCode,
      currentTime,
    } = filters;

    const cacheKey = `${membershipType}_${vendorCategory}_${countryCode}`;
    const cached = this.offerCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data.filter(offer => this.isOfferTimeValid(offer, currentTime));
    }

    // Build query
    let queryText = `
      SELECT * FROM offers 
      WHERE is_active = true 
      AND (valid_from IS NULL OR valid_from <= $1)
      AND (valid_until IS NULL OR valid_until >= $1)
    `;
    const params = [currentTime];
    let paramIndex = 2;

    // Membership type filter
    if (membershipType) {
      queryText += ` AND (membership_type IS NULL OR membership_type = $${paramIndex})`;
      params.push(membershipType);
      paramIndex++;
    }

    // Vendor category filter
    if (vendorCategory) {
      queryText += ` AND (vendor_category IS NULL OR vendor_category = $${paramIndex})`;
      params.push(vendorCategory);
      paramIndex++;
    }

    // Country filter
    if (countryCode) {
      queryText += ` AND (country_code IS NULL OR country_code = $${paramIndex})`;
      params.push(countryCode);
      paramIndex++;
    }

    queryText += ` ORDER BY priority DESC, id DESC`;

    const result = await query(queryText, params);

    const offers = result.rows.filter(offer => this.isOfferTimeValid(offer, currentTime));

    // Update cache
    this.offerCache.set(cacheKey, {
      data: result.rows,
      timestamp: Date.now(),
    });

    return offers;
  }

  /**
   * Check if offer is valid at current time (time restrictions)
   */
  isOfferTimeValid(offer, currentTime) {
    if (!offer.time_restrictions || Object.keys(offer.time_restrictions).length === 0) {
      return true;
    }

    const restrictions = offer.time_restrictions;
    const now = new Date(currentTime);
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    // Check day restrictions
    if (restrictions.days && Array.isArray(restrictions.days)) {
      if (!restrictions.days.includes(dayOfWeek)) {
        return false;
      }
    }

    // Check time range restrictions
    if (restrictions.timeRanges && Array.isArray(restrictions.timeRanges)) {
      const inRange = restrictions.timeRanges.some(range => {
        return hour >= range.start && hour < range.end;
      });
      if (!inRange) {
        return false;
      }
    }

    return true;
  }

  /**
   * Score an offer based on eligibility and value
   */
  scoreOffer(offer, usageHistory, maxDiscountPercentage) {
    let eligible = true;
    let priority = offer.priority || 0;

    // Check usage limit
    if (offer.usage_limit) {
      const usageCount = usageHistory.filter(u => u.offer_id === offer.id).length;
      if (usageCount >= offer.usage_limit) {
        eligible = false;
      }
    }

    // Check discount cap (country rule)
    if (offer.discount_percentage && offer.discount_percentage > maxDiscountPercentage) {
      // Adjust discount to max allowed
      offer.discount_percentage = maxDiscountPercentage;
    }

    // Boost priority for flash offers
    if (offer.offer_type === 'flash') {
      priority += 10;
    }

    // Boost priority for VIP access
    if (offer.offer_type === 'vip_access') {
      priority += 5;
    }

    return {
      offer,
      eligible,
      priority,
    };
  }

  /**
   * Calculate final discount amount
   */
  calculateDiscount(offer, maxDiscountPercentage) {
    let discountPercentage = 0;
    let discountAmount = 0;

    if (offer.offer_type === 'percentage' && offer.discount_percentage) {
      discountPercentage = Math.min(
        parseFloat(offer.discount_percentage),
        maxDiscountPercentage
      );
    } else if (offer.offer_type === 'fixed_amount' && offer.discount_amount) {
      discountAmount = parseFloat(offer.discount_amount);
    }

    // Apply max discount cap if set
    if (offer.max_discount_amount && discountAmount > parseFloat(offer.max_discount_amount)) {
      discountAmount = parseFloat(offer.max_discount_amount);
    }

    return {
      discountPercentage,
      discountAmount,
    };
  }

  /**
   * Get member's offer usage history
   */
  async getMemberUsageHistory(memberId) {
    const result = await query(
      `SELECT offer_id, used_at 
       FROM offer_usage_logs 
       WHERE member_id = $1 
       ORDER BY used_at DESC 
       LIMIT 100`,
      [memberId]
    );

    return result.rows;
  }

  /**
   * Log offer usage
   */
  async logOfferUsage(usageData) {
    const {
      offerId,
      memberId,
      vendorId,
      nfcTapLogId,
      discountAmount,
      originalAmount,
      finalAmount,
    } = usageData;

    await query(
      `INSERT INTO offer_usage_logs 
       (offer_id, member_id, vendor_id, nfc_tap_log_id, discount_amount, original_amount, final_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        offerId,
        memberId,
        vendorId,
        nfcTapLogId,
        discountAmount,
        originalAmount,
        finalAmount,
      ]
    );
  }

  /**
   * Clear offer cache
   */
  clearCache() {
    this.offerCache.clear();
  }
}

export default new OfferEngine();





