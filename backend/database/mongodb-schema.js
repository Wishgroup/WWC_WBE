/**
 * MongoDB Schema Definitions for Wish Waves Club
 * Converted from PostgreSQL schema
 */

// MongoDB Collections Structure

export const collections = {
  MEMBERS: 'members',
  NFC_CARDS: 'nfc_cards',
  VENDORS: 'vendors',
  POS_READERS: 'pos_readers',
  COUNTRY_RULES: 'country_rules',
  NFC_TAP_LOGS: 'nfc_tap_logs',
  FRAUD_EVENTS: 'fraud_events',
  OFFERS: 'offers',
  OFFER_USAGE_LOGS: 'offer_usage_logs',
  ADMIN_USERS: 'admin_users',
  AUDIT_LOGS: 'audit_logs',
};

/**
 * Index Definitions for MongoDB Collections
 */
export const indexes = {
  // Members Collection
  members: [
    { key: { email: 1 }, unique: true, name: 'idx_email' },
    { key: { membership_status: 1 }, name: 'idx_membership_status' },
    { key: { fraud_status: 1 }, name: 'idx_fraud_status' },
    { key: { referral_code: 1 }, unique: true, sparse: true, name: 'idx_referral_code' },
    { key: { referred_by: 1 }, name: 'idx_referred_by' },
  ],

  // NFC Cards Collection
  nfc_cards: [
    { key: { card_uid: 1 }, unique: true, name: 'idx_card_uid' },
    { key: { member_id: 1 }, name: 'idx_member_id' },
    { key: { card_status: 1 }, name: 'idx_card_status' },
    { key: { member_id: 1, is_primary: 1 }, name: 'idx_member_primary' },
  ],

  // Vendors Collection
  vendors: [
    { key: { vendor_code: 1 }, unique: true, name: 'idx_vendor_code' },
    { key: { country: 1 }, name: 'idx_country' },
    { key: { is_active: 1 }, name: 'idx_is_active' },
  ],

  // POS Readers Collection
  pos_readers: [
    { key: { reader_id: 1 }, unique: true, name: 'idx_reader_id' },
    { key: { vendor_id: 1 }, name: 'idx_vendor_id' },
  ],

  // Country Rules Collection
  country_rules: [
    { key: { country_code: 1 }, unique: true, name: 'idx_country_code' },
    { key: { is_active: 1 }, name: 'idx_is_active' },
  ],

  // NFC Tap Logs Collection
  nfc_tap_logs: [
    { key: { member_id: 1 }, name: 'idx_member_id' },
    { key: { card_uid: 1 }, name: 'idx_card_uid' },
    { key: { vendor_id: 1 }, name: 'idx_vendor_id' },
    { key: { tap_timestamp: -1 }, name: 'idx_tap_timestamp' },
    { key: { card_uid: 1, tap_timestamp: -1 }, name: 'idx_card_timestamp' },
    { key: { member_id: 1, tap_timestamp: -1 }, name: 'idx_member_timestamp' },
  ],

  // Fraud Events Collection
  fraud_events: [
    { key: { member_id: 1 }, name: 'idx_member_id' },
    { key: { severity: 1 }, name: 'idx_severity' },
    { key: { created_at: -1 }, name: 'idx_created_at' },
    { key: { resolved: 1, created_at: -1 }, name: 'idx_unresolved' },
  ],

  // Offers Collection
  offers: [
    { key: { offer_code: 1 }, unique: true, sparse: true, name: 'idx_offer_code' },
    { key: { is_active: 1 }, name: 'idx_is_active' },
    { key: { membership_type: 1 }, name: 'idx_membership_type' },
    { key: { country_code: 1 }, name: 'idx_country_code' },
    { key: { valid_from: 1, valid_until: 1 }, name: 'idx_validity' },
  ],

  // Offer Usage Logs Collection
  offer_usage_logs: [
    { key: { offer_id: 1 }, name: 'idx_offer_id' },
    { key: { member_id: 1 }, name: 'idx_member_id' },
    { key: { vendor_id: 1 }, name: 'idx_vendor_id' },
    { key: { used_at: -1 }, name: 'idx_used_at' },
  ],

  // Admin Users Collection
  admin_users: [
    { key: { email: 1 }, unique: true, name: 'idx_email' },
    { key: { is_active: 1 }, name: 'idx_is_active' },
  ],

  // Audit Logs Collection
  audit_logs: [
    { key: { created_at: -1 }, name: 'idx_created_at' },
    { key: { user_type: 1, created_at: -1 }, name: 'idx_user_type' },
    { key: { resource_type: 1, resource_id: 1 }, name: 'idx_resource' },
  ],
};

/**
 * Schema Validation Rules (Optional - for MongoDB 3.6+)
 */
export const validationRules = {
  members: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'full_name', 'membership_type', 'subscription_start_date'],
      properties: {
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        membership_type: { enum: ['annual', 'lifetime'] },
        membership_status: { enum: ['active', 'expired', 'suspended', 'cancelled'] },
        fraud_status: { enum: ['clean', 'monitored', 'restricted', 'blocked'] },
      },
    },
  },
};


