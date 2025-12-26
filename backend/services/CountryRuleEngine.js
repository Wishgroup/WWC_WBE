/**
 * Multi-Country Vendor Rules Engine
 * Enforces country-specific business, legal, and commercial rules
 * Config-driven (database), not hardcoded
 */

import { query } from '../database/connection.js';

class CountryRuleEngine {
  constructor() {
    this.ruleCache = new Map(); // Cache for performance
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Validate vendor and member against country rules
   * @param {Object} validationData
   * @returns {Object} Validation result
   */
  async validateCountryRules(validationData) {
    const {
      vendorId,
      memberId,
      membershipType,
    } = validationData;

    try {
      // Get vendor country
      const vendor = await query(
        `SELECT country, city, currency, allowed_membership_tiers, max_discount_percentage 
         FROM vendors 
         WHERE id = $1 AND is_active = true`,
        [vendorId]
      );

      if (vendor.rows.length === 0) {
        return {
          valid: false,
          reason: 'vendor_not_found_or_inactive',
        };
      }

      const vendorData = vendor.rows[0];
      const countryCode = this.getCountryCode(vendorData.country);

      // Get country rules
      const countryRules = await this.getCountryRules(countryCode);

      if (!countryRules) {
        return {
          valid: false,
          reason: 'country_rules_not_configured',
        };
      }

      // 1. Check if membership type is allowed in this country
      if (!countryRules.allowed_membership_types.includes(membershipType)) {
        return {
          valid: false,
          reason: 'membership_type_not_allowed_in_country',
          details: {
            membershipType,
            country: countryCode,
            allowedTypes: countryRules.allowed_membership_types,
          },
        };
      }

      // 2. Check if membership type is allowed by vendor
      if (vendorData.allowed_membership_tiers && 
          !vendorData.allowed_membership_tiers.includes(membershipType)) {
        return {
          valid: false,
          reason: 'membership_type_not_allowed_by_vendor',
          details: {
            membershipType,
            vendorAllowedTypes: vendorData.allowed_membership_tiers,
          },
        };
      }

      // 3. Check blackout periods
      const blackoutCheck = this.checkBlackoutPeriods(
        countryRules.blackout_periods,
        new Date()
      );
      if (!blackoutCheck.allowed) {
        return {
          valid: false,
          reason: 'blackout_period_active',
          details: blackoutCheck,
        };
      }

      // 4. Check compliance restrictions
      const complianceCheck = this.checkComplianceRestrictions(
        countryRules.compliance_restrictions,
        membershipType
      );
      if (!complianceCheck.allowed) {
        return {
          valid: false,
          reason: 'compliance_restriction',
          details: complianceCheck,
        };
      }

      // Return max discount allowed (country rule vs vendor rule - take minimum)
      const maxDiscount = Math.min(
        parseFloat(countryRules.max_discount_percentage),
        parseFloat(vendorData.max_discount_percentage || 100)
      );

      return {
        valid: true,
        countryCode,
        currency: countryRules.currency,
        maxDiscountPercentage: maxDiscount,
        taxRules: countryRules.tax_rules,
        vendorData: {
          country: vendorData.country,
          city: vendorData.city,
          currency: vendorData.currency,
        },
      };
    } catch (error) {
      console.error('Country rule validation error:', error);
      return {
        valid: false,
        reason: 'validation_error',
        error: error.message,
      };
    }
  }

  /**
   * Get country rules from database (with caching)
   */
  async getCountryRules(countryCode) {
    // Check cache first
    const cacheKey = countryCode;
    const cached = this.ruleCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    // Fetch from database
    const result = await query(
      `SELECT * FROM country_rules 
       WHERE country_code = $1 AND is_active = true`,
      [countryCode]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const rules = result.rows[0];
    
    // Parse JSONB fields
    const countryRules = {
      id: rules.id,
      countryCode: rules.country_code,
      countryName: rules.country_name,
      allowed_membership_types: rules.allowed_membership_types || [],
      max_discount_percentage: parseFloat(rules.max_discount_percentage),
      tax_rules: rules.tax_rules || {},
      compliance_restrictions: rules.compliance_restrictions || {},
      blackout_periods: rules.blackout_periods || {},
      currency: rules.currency,
    };

    // Update cache
    this.ruleCache.set(cacheKey, {
      data: countryRules,
      timestamp: Date.now(),
    });

    return countryRules;
  }

  /**
   * Check if current time is within blackout period
   */
  checkBlackoutPeriods(blackoutPeriods, currentTime) {
    if (!blackoutPeriods || Object.keys(blackoutPeriods).length === 0) {
      return { allowed: true };
    }

    const now = new Date(currentTime);
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Check date-specific blackouts
    if (blackoutPeriods.dates && Array.isArray(blackoutPeriods.dates)) {
      if (blackoutPeriods.dates.includes(dateStr)) {
        return {
          allowed: false,
          reason: 'date_blackout',
          blackoutDate: dateStr,
        };
      }
    }

    // Check day-of-week blackouts
    if (blackoutPeriods.days && Array.isArray(blackoutPeriods.days)) {
      if (blackoutPeriods.days.includes(dayOfWeek)) {
        return {
          allowed: false,
          reason: 'day_blackout',
          dayOfWeek,
        };
      }
    }

    // Check time-range blackouts
    if (blackoutPeriods.timeRanges && Array.isArray(blackoutPeriods.timeRanges)) {
      for (const range of blackoutPeriods.timeRanges) {
        if (hour >= range.start && hour < range.end) {
          return {
            allowed: false,
            reason: 'time_blackout',
            timeRange: range,
          };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Check compliance restrictions
   */
  checkComplianceRestrictions(complianceRestrictions, membershipType) {
    if (!complianceRestrictions || Object.keys(complianceRestrictions).length === 0) {
      return { allowed: true };
    }

    // Check if membership type is restricted
    if (complianceRestrictions.restrictedMembershipTypes && 
        Array.isArray(complianceRestrictions.restrictedMembershipTypes)) {
      if (complianceRestrictions.restrictedMembershipTypes.includes(membershipType)) {
        return {
          allowed: false,
          reason: 'membership_type_restricted_by_compliance',
          membershipType,
        };
      }
    }

    // Add more compliance checks as needed
    return { allowed: true };
  }

  /**
   * Convert country name to country code (simplified - can be enhanced)
   */
  getCountryCode(countryName) {
    // Common country mappings
    const countryMap = {
      'United Arab Emirates': 'AE',
      'UAE': 'AE',
      'United States': 'US',
      'USA': 'US',
      'United Kingdom': 'GB',
      'UK': 'GB',
      'Saudi Arabia': 'SA',
      'KSA': 'SA',
      'Qatar': 'QA',
      'Kuwait': 'KW',
      'Bahrain': 'BH',
      'Oman': 'OM',
    };

    // Try direct lookup
    if (countryMap[countryName]) {
      return countryMap[countryName];
    }

    // Try case-insensitive lookup
    const normalized = countryName.toUpperCase();
    for (const [key, value] of Object.entries(countryMap)) {
      if (key.toUpperCase() === normalized) {
        return value;
      }
    }

    // Default: use first 2 uppercase letters
    return countryName.substring(0, 2).toUpperCase();
  }

  /**
   * Clear cache (useful for admin updates)
   */
  clearCache(countryCode = null) {
    if (countryCode) {
      this.ruleCache.delete(countryCode);
    } else {
      this.ruleCache.clear();
    }
  }

  /**
   * Create or update country rules (admin function)
   */
  async upsertCountryRules(rulesData) {
    const {
      countryCode,
      countryName,
      allowedMembershipTypes,
      maxDiscountPercentage,
      taxRules,
      complianceRestrictions,
      blackoutPeriods,
      currency,
    } = rulesData;

    const result = await query(
      `INSERT INTO country_rules 
       (country_code, country_name, allowed_membership_types, max_discount_percentage, 
        tax_rules, compliance_restrictions, blackout_periods, currency, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (country_code) 
       DO UPDATE SET
         country_name = EXCLUDED.country_name,
         allowed_membership_types = EXCLUDED.allowed_membership_types,
         max_discount_percentage = EXCLUDED.max_discount_percentage,
         tax_rules = EXCLUDED.tax_rules,
         compliance_restrictions = EXCLUDED.compliance_restrictions,
         blackout_periods = EXCLUDED.blackout_periods,
         currency = EXCLUDED.currency,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        countryCode,
        countryName,
        allowedMembershipTypes,
        maxDiscountPercentage,
        JSON.stringify(taxRules || {}),
        JSON.stringify(complianceRestrictions || {}),
        JSON.stringify(blackoutPeriods || {}),
        currency,
      ]
    );

    // Clear cache
    this.clearCache(countryCode);

    return result.rows[0];
  }
}

export default new CountryRuleEngine();





