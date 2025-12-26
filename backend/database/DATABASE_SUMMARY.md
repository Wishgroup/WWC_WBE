# Database Summary - Quick Reference

## Core Entities

### 1. **Members** (11 tables total)
- Stores member information, subscriptions, and fraud status
- **Key Fields**: email, membership_type, fraud_score, fraud_status
- **Relationships**: Has many NFC cards, has many tap logs, has many fraud events

### 2. **NFC Cards**
- Manages physical card lifecycle
- **Key Fields**: card_uid (unique), card_status, encrypted_token
- **Relationships**: Belongs to one member, referenced in tap logs

### 3. **Vendors**
- Vendor business information and rules
- **Key Fields**: vendor_code (unique, used as API key), country, city, currency
- **Relationships**: Has many POS readers, has many tap logs

### 4. **Country Rules**
- Config-driven country-specific business rules
- **Key Fields**: country_code (unique), max_discount_percentage, blackout_periods (JSONB)
- **Relationships**: Referenced by validation pipeline

### 5. **NFC Tap Logs** (Critical for Fraud Detection)
- Every NFC interaction logged
- **Key Fields**: member_id, card_uid, vendor_id, fraud_score, fraud_flags, offer_applied
- **Relationships**: Links members, cards, vendors, and offers

### 6. **Fraud Events**
- All fraud detection events
- **Key Fields**: event_type, severity, fraud_score, resolved
- **Relationships**: Linked to members, cards, and vendors

### 7. **Offers**
- Dynamic offer definitions
- **Key Fields**: offer_code (unique), offer_type, priority, is_active
- **Relationships**: Has many usage logs

### 8. **Offer Usage Logs**
- Tracks offer usage for analytics
- **Key Fields**: offer_id, member_id, discount_amount
- **Relationships**: Links offers, members, vendors, and tap logs

### 9. **Admin Users**
- Admin authentication
- **Key Fields**: email (unique), password_hash, role

### 10. **Audit Logs**
- Complete system audit trail
- **Key Fields**: action, resource_type, resource_id, details (JSONB)

### 11. **POS Readers**
- Individual NFC reader devices
- **Key Fields**: reader_id (unique), vendor_id
- **Relationships**: Belongs to one vendor

## Data Flow

```
Member Registration
    ↓
NFC Card Issuance
    ↓
NFC Tap at Vendor
    ↓
Tap Logged → Fraud Detection → Country Rules → Offer Calculation
    ↓
Response to POS
```

## Key Indexes

- **Performance Critical**:
  - `members.email` (login/authentication)
  - `nfc_cards.card_uid` (tap validation)
  - `nfc_tap_logs.tap_timestamp` (fraud detection queries)
  - `fraud_events.member_id` (member fraud history)

## JSONB Fields (Flexible Data)

1. **country_rules.tax_rules** - Tax configuration
2. **country_rules.blackout_periods** - Time restrictions
3. **nfc_tap_logs.offer_applied** - Offer details
4. **fraud_events.metadata** - Event context
5. **offers.time_restrictions** - Day/time rules
6. **audit_logs.details** - Action context

## Foreign Key Relationships

```
members (1) ──< (many) nfc_cards
members (1) ──< (many) nfc_tap_logs
members (1) ──< (many) fraud_events
members (1) ──< (many) offer_usage_logs
members (1) ──< (many) members (referred_by)

vendors (1) ──< (many) pos_readers
vendors (1) ──< (many) nfc_tap_logs
vendors (1) ──< (many) fraud_events
vendors (1) ──< (many) offer_usage_logs

offers (1) ──< (many) offer_usage_logs
nfc_tap_logs (1) ──< (many) offer_usage_logs
```

## Table Sizes (Estimated)

- **Small Tables** (< 10K rows): admin_users, country_rules, pos_readers
- **Medium Tables** (10K - 1M rows): members, nfc_cards, vendors, offers, fraud_events
- **Large Tables** (> 1M rows): nfc_tap_logs, offer_usage_logs, audit_logs

## Query Patterns

### Most Common Queries

1. **NFC Validation**: Lookup card by UID → Get member → Check status
2. **Fraud Detection**: Query recent taps for same card → Calculate fraud score
3. **Offer Calculation**: Find eligible offers → Select best one
4. **Analytics**: Aggregate tap logs by vendor/member/time period

### Performance Considerations

- **Hot Path**: NFC validation (must be < 100ms)
- **Analytics**: Can be slower, use aggregations
- **Fraud Detection**: Batch queries for recent taps
- **Offer Calculation**: Cache active offers

## Backup Priority

1. **Critical**: members, nfc_cards, nfc_tap_logs
2. **Important**: fraud_events, offers, country_rules
3. **Standard**: vendors, pos_readers, offer_usage_logs
4. **Archive**: audit_logs (can be archived after 1 year)

## Security Notes

- **Sensitive**: password_hash, encrypted_token
- **PII**: email, full_name, phone (GDPR considerations)
- **Audit**: All changes tracked in audit_logs
- **Access**: Database user with read/write, no DROP privileges


