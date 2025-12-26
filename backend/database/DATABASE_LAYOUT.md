# Wish Waves Club Database Layout

## Overview

The Wish Waves Club database uses **PostgreSQL** with a relational schema designed for:
- Member management and subscriptions
- NFC card lifecycle management
- Fraud detection and analytics
- Multi-country vendor rules
- Dynamic offers system
- Comprehensive audit logging

## Database Schema Diagram

```
┌─────────────────┐
│    members      │
│─────────────────│
│ id (PK)         │
│ email (UNIQUE)  │
│ full_name       │
│ phone           │
│ country         │
│ city            │
│ membership_type │
│ membership_status│
│ subscription_*  │
│ fraud_score     │
│ fraud_status    │
│ referral_code   │
│ referred_by (FK)│──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │
│   nfc_cards     │  │
│─────────────────│  │
│ id (PK)         │  │
│ member_id (FK)──┼──┼──┐
│ card_uid (UNIQUE)│  │  │
│ encrypted_token │  │  │
│ card_status     │  │  │
│ issued_at       │  │  │
│ blocked_at      │  │  │
│ expiry_date     │  │  │
│ is_primary      │  │  │
│ previous_uid    │  │  │
└─────────────────┘  │  │
                     │  │
┌─────────────────┐  │  │
│    vendors      │  │  │
│─────────────────│  │  │
│ id (PK)         │  │  │
│ vendor_name     │  │  │
│ vendor_code (UNIQUE)│ │ │
│ country         │  │  │
│ city            │  │  │
│ currency        │  │  │
│ category        │  │  │
│ allowed_membership_tiers│
│ max_discount_percentage│
│ tax_rate        │  │  │
│ is_active       │  │  │
│ compliance_status│ │  │
└─────────────────┘  │  │
      │              │  │
      │              │  │
┌─────┴──────────┐   │  │
│  pos_readers  │   │  │
│───────────────│   │  │
│ id (PK)       │   │  │
│ vendor_id (FK)┼───┘  │
│ reader_id (UNIQUE)  │
│ reader_name   │      │
│ location_description│
│ is_active     │      │
└───────────────┘      │
                       │
┌──────────────────────┴──────────────┐
│        nfc_tap_logs                │
│────────────────────────────────────│
│ id (PK)                            │
│ member_id (FK)──────────────────────┘
│ card_uid                           │
│ vendor_id (FK)──────────────────────┐
│ vendor_country                     │ │
│ vendor_city                        │ │
│ pos_reader_id                      │ │
│ tap_timestamp                      │ │
│ latitude                           │ │
│ longitude                          │ │
│ fraud_score                        │ │
│ fraud_flags (ARRAY)                │ │
│ validation_result                  │ │
│ offer_applied (JSONB)              │ │
└────────────────────────────────────┘ │
                                       │
┌──────────────────────────────────────┴──────┐
│            fraud_events                     │
│─────────────────────────────────────────────│
│ id (PK)                                     │
│ member_id (FK)──────────────────────────────┘
│ card_uid                                    │
│ vendor_id (FK)──────────────────────────────┐
│ event_type                                 │ │
│ severity                                   │ │
│ fraud_score                                │ │
│ description                                │ │
│ metadata (JSONB)                           │ │
│ action_taken                               │ │
│ resolved                                   │ │
│ resolved_at                                │ │
│ resolved_by                                │ │
└────────────────────────────────────────────┘ │
                                               │
┌──────────────────────────────────────────────┴──────┐
│                  country_rules                      │
│─────────────────────────────────────────────────────│
│ id (PK)                                             │
│ country_code (UNIQUE)                               │
│ country_name                                        │
│ allowed_membership_types (ARRAY)                    │
│ max_discount_percentage                             │
│ tax_rules (JSONB)                                   │
│ compliance_restrictions (JSONB)                      │
│ blackout_periods (JSONB)                            │
│ currency                                            │
│ is_active                                           │
└─────────────────────────────────────────────────────┘

┌─────────────────┐
│     offers      │
│─────────────────│
│ id (PK)         │
│ offer_code (UNIQUE)│
│ offer_type      │
│ membership_type │
│ vendor_category │
│ country_code    │
│ discount_*      │
│ valid_from      │
│ valid_until     │
│ time_restrictions (JSONB)│
│ usage_limit     │
│ priority        │
│ is_active       │
└────────┬────────┘
         │
┌────────┴──────────────┐
│  offer_usage_logs    │
│──────────────────────│
│ id (PK)              │
│ offer_id (FK)────────┘
│ member_id (FK)───────┐
│ vendor_id (FK)───────┼──┐
│ nfc_tap_log_id (FK)──┼──┼──┐
│ discount_amount      │  │  │
│ original_amount      │  │  │
│ final_amount         │  │  │
│ used_at              │  │  │
└──────────────────────┘  │  │
                           │  │
┌──────────────────────────┴──┴──────┐
│         audit_logs                │
│───────────────────────────────────│
│ id (PK)                           │
│ user_type                         │
│ user_id                           │
│ action                            │
│ resource_type                     │
│ resource_id                       │
│ details (JSONB)                   │
│ ip_address                        │
│ user_agent                        │
│ created_at                        │
└───────────────────────────────────┘

┌─────────────────┐
│  admin_users    │
│─────────────────│
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ full_name       │
│ role            │
│ is_active       │
│ last_login      │
│ created_at      │
└─────────────────┘
```

## Table Definitions

### 1. `members` - Member Information

**Purpose**: Stores all member data including subscription and fraud status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing member ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Member email address |
| `full_name` | VARCHAR(255) | NOT NULL | Member full name |
| `phone` | VARCHAR(50) | | Contact phone number |
| `country` | VARCHAR(100) | | Member country |
| `city` | VARCHAR(100) | | Member city |
| `membership_type` | VARCHAR(50) | NOT NULL | 'annual' or 'lifetime' |
| `membership_status` | VARCHAR(50) | DEFAULT 'active' | 'active', 'expired', 'suspended', 'cancelled' |
| `subscription_start_date` | TIMESTAMP | NOT NULL | When subscription started |
| `subscription_end_date` | TIMESTAMP | | When subscription expires (NULL for lifetime) |
| `payment_amount` | DECIMAL(10, 2) | | Amount paid |
| `payment_status` | VARCHAR(50) | | Payment status |
| `referral_code` | VARCHAR(50) | UNIQUE | Unique referral code |
| `referred_by` | INTEGER | FK → members.id | Member who referred this member |
| `fraud_score` | INTEGER | DEFAULT 0 | Current fraud score (0-100) |
| `fraud_status` | VARCHAR(50) | DEFAULT 'clean' | 'clean', 'monitored', 'restricted', 'blocked' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- `idx_members_email` on `email`
- `idx_members_membership_status` on `membership_status`
- `idx_members_fraud_status` on `fraud_status`

**Relationships**:
- Self-referential: `referred_by` → `members.id`
- One-to-many: `members.id` → `nfc_cards.member_id`

---

### 2. `nfc_cards` - NFC Card Management

**Purpose**: Manages NFC card lifecycle including issuance, blocking, and reissuance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing card ID |
| `member_id` | INTEGER | FK → members.id, NOT NULL | Owner member |
| `card_uid` | VARCHAR(100) | UNIQUE, NOT NULL | Physical card UID |
| `encrypted_token` | TEXT | NOT NULL | Encrypted backend token |
| `card_status` | VARCHAR(50) | DEFAULT 'active' | 'active', 'blocked', 'expired', 'lost', 'stolen', 'damaged', 'blacklisted' |
| `issued_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Card issuance time |
| `blocked_at` | TIMESTAMP | | When card was blocked |
| `expiry_date` | TIMESTAMP | | Card expiration date |
| `is_primary` | BOOLEAN | DEFAULT true | Primary card flag |
| `previous_uid` | VARCHAR(100) | | Previous UID (for reissued cards) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- `idx_nfc_cards_uid` on `card_uid`
- `idx_nfc_cards_member_id` on `member_id`
- `idx_nfc_cards_status` on `card_status`

**Relationships**:
- Many-to-one: `member_id` → `members.id` (CASCADE DELETE)

---

### 3. `vendors` - Vendor Information

**Purpose**: Stores vendor data including location, currency, and discount rules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing vendor ID |
| `vendor_name` | VARCHAR(255) | NOT NULL | Vendor business name |
| `vendor_code` | VARCHAR(100) | UNIQUE, NOT NULL | Unique vendor identifier (API key) |
| `country` | VARCHAR(100) | NOT NULL | Vendor country |
| `city` | VARCHAR(100) | NOT NULL | Vendor city |
| `currency` | VARCHAR(10) | NOT NULL | Currency code (AED, USD, etc.) |
| `category` | VARCHAR(100) | | 'restaurant', 'wellness', 'retail', 'travel', etc. |
| `allowed_membership_tiers` | TEXT[] | | Array of allowed membership types |
| `max_discount_percentage` | DECIMAL(5, 2) | DEFAULT 0 | Maximum discount vendor can offer |
| `tax_rate` | DECIMAL(5, 2) | DEFAULT 0 | Tax rate percentage |
| `is_active` | BOOLEAN | DEFAULT true | Vendor active status |
| `compliance_status` | VARCHAR(50) | DEFAULT 'compliant' | Compliance status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- `idx_vendors_country` on `country`
- `idx_vendors_code` on `vendor_code`

**Relationships**:
- One-to-many: `vendors.id` → `pos_readers.vendor_id`
- One-to-many: `vendors.id` → `nfc_tap_logs.vendor_id`

---

### 4. `pos_readers` - POS/NFC Reader Devices

**Purpose**: Tracks individual POS/NFC reader devices at vendor locations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing reader ID |
| `vendor_id` | INTEGER | FK → vendors.id, NOT NULL | Parent vendor |
| `reader_id` | VARCHAR(100) | UNIQUE, NOT NULL | Unique reader identifier |
| `reader_name` | VARCHAR(255) | | Human-readable name |
| `location_description` | TEXT | | Physical location description |
| `is_active` | BOOLEAN | DEFAULT true | Reader active status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Relationships**:
- Many-to-one: `vendor_id` → `vendors.id` (CASCADE DELETE)

---

### 5. `country_rules` - Country-Specific Business Rules

**Purpose**: Config-driven country rules for membership, discounts, and compliance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing rule ID |
| `country_code` | VARCHAR(10) | UNIQUE, NOT NULL | ISO country code (AE, US, etc.) |
| `country_name` | VARCHAR(100) | NOT NULL | Country name |
| `allowed_membership_types` | TEXT[] | NOT NULL | Array of allowed membership types |
| `max_discount_percentage` | DECIMAL(5, 2) | NOT NULL | Maximum discount allowed in country |
| `tax_rules` | JSONB | | Flexible tax configuration |
| `compliance_restrictions` | JSONB | | Legal/compliance rules |
| `blackout_periods` | JSONB | | Time-based restrictions |
| `currency` | VARCHAR(10) | NOT NULL | Country currency code |
| `is_active` | BOOLEAN | DEFAULT true | Rule active status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- `idx_offers_country_code` on `country_code`

**JSONB Structure Examples**:

`tax_rules`:
```json
{
  "vat_rate": 5.0,
  "tax_included": true
}
```

`blackout_periods`:
```json
{
  "dates": ["2025-12-25", "2026-01-01"],
  "days": [0, 6],
  "timeRanges": [
    {"start": 0, "end": 6}
  ]
}
```

---

### 6. `nfc_tap_logs` - NFC Tap Transaction Logs

**Purpose**: Logs every NFC interaction for fraud detection and analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing log ID |
| `member_id` | INTEGER | FK → members.id, NOT NULL | Member who tapped |
| `card_uid` | VARCHAR(100) | NOT NULL | Card UID used |
| `vendor_id` | INTEGER | FK → vendors.id, NOT NULL | Vendor location |
| `vendor_country` | VARCHAR(100) | NOT NULL | Vendor country |
| `vendor_city` | VARCHAR(100) | NOT NULL | Vendor city |
| `pos_reader_id` | VARCHAR(100) | NOT NULL | POS reader identifier |
| `tap_timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When tap occurred |
| `latitude` | DECIMAL(10, 8) | | GPS latitude |
| `longitude` | DECIMAL(11, 8) | | GPS longitude |
| `fraud_score` | INTEGER | DEFAULT 0 | Fraud score at time of tap |
| `fraud_flags` | TEXT[] | | Array of fraud indicators detected |
| `validation_result` | VARCHAR(50) | | 'approved', 'rejected', 'restricted' |
| `offer_applied` | JSONB | | Dynamic offer details if applied |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes**:
- `idx_nfc_tap_logs_member_id` on `member_id`
- `idx_nfc_tap_logs_card_uid` on `card_uid`
- `idx_nfc_tap_logs_vendor_id` on `vendor_id`
- `idx_nfc_tap_logs_timestamp` on `tap_timestamp`

**Relationships**:
- Many-to-one: `member_id` → `members.id`
- Many-to-one: `vendor_id` → `vendors.id`

**Usage**: Primary data source for fraud detection analytics and ML training.

---

### 7. `fraud_events` - Fraud Detection Events

**Purpose**: Records all fraud detection events with severity and resolution tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing event ID |
| `member_id` | INTEGER | FK → members.id | Associated member |
| `card_uid` | VARCHAR(100) | | Card UID involved |
| `vendor_id` | INTEGER | FK → vendors.id | Vendor location |
| `event_type` | VARCHAR(100) | NOT NULL | 'geo_inconsistency', 'excessive_taps', 'country_mismatch', 'expired_access', 'cloning_attempt' |
| `severity` | VARCHAR(50) | NOT NULL | 'low', 'medium', 'high' |
| `fraud_score` | INTEGER | NOT NULL | Fraud score (0-100) |
| `description` | TEXT | | Human-readable description |
| `metadata` | JSONB | | Additional event data |
| `action_taken` | VARCHAR(100) | | 'logged', 'soft_restriction', 'card_blocked', 'admin_alert' |
| `resolved` | BOOLEAN | DEFAULT false | Whether event is resolved |
| `resolved_at` | TIMESTAMP | | Resolution timestamp |
| `resolved_by` | INTEGER | | Admin user ID who resolved |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Event creation time |

**Indexes**:
- `idx_fraud_events_member_id` on `member_id`
- `idx_fraud_events_severity` on `severity`
- `idx_fraud_events_created_at` on `created_at`

**Relationships**:
- Many-to-one: `member_id` → `members.id`
- Many-to-one: `vendor_id` → `vendors.id`

---

### 8. `offers` - Dynamic Offer Definitions

**Purpose**: Stores offer definitions for real-time offer calculation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing offer ID |
| `offer_code` | VARCHAR(100) | UNIQUE | Unique offer identifier |
| `offer_type` | VARCHAR(50) | NOT NULL | 'percentage', 'fixed_amount', 'free_addon', 'vip_access', 'event_access', 'flash' |
| `membership_type` | VARCHAR(50) | | NULL = all types, or specific type |
| `vendor_category` | VARCHAR(100) | | NULL = all categories, or specific category |
| `country_code` | VARCHAR(10) | | NULL = all countries, or specific country |
| `discount_percentage` | DECIMAL(5, 2) | | Percentage discount (0-100) |
| `discount_amount` | DECIMAL(10, 2) | | Fixed amount discount |
| `min_purchase_amount` | DECIMAL(10, 2) | | Minimum purchase required |
| `max_discount_amount` | DECIMAL(10, 2) | | Maximum discount cap |
| `valid_from` | TIMESTAMP | | Offer start date |
| `valid_until` | TIMESTAMP | | Offer end date |
| `time_restrictions` | JSONB | | Day/time restrictions |
| `usage_limit` | INTEGER | | Max uses per member |
| `priority` | INTEGER | DEFAULT 0 | Higher = more priority |
| `is_active` | BOOLEAN | DEFAULT true | Offer active status |
| `conditions` | JSONB | | Additional conditions |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes**:
- `idx_offers_active` on `is_active`
- `idx_offers_membership_type` on `membership_type`
- `idx_offers_country_code` on `country_code`

**JSONB Structure Example**:

`time_restrictions`:
```json
{
  "days": [1, 2, 3, 4, 5],
  "timeRanges": [
    {"start": 10, "end": 14}
  ]
}
```

---

### 9. `offer_usage_logs` - Offer Usage Tracking

**Purpose**: Tracks offer usage for analytics and limit enforcement.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing log ID |
| `offer_id` | INTEGER | FK → offers.id, NOT NULL | Offer used |
| `member_id` | INTEGER | FK → members.id, NOT NULL | Member who used offer |
| `vendor_id` | INTEGER | FK → vendors.id, NOT NULL | Vendor where used |
| `nfc_tap_log_id` | INTEGER | FK → nfc_tap_logs.id | Associated tap log |
| `discount_amount` | DECIMAL(10, 2) | | Discount amount applied |
| `original_amount` | DECIMAL(10, 2) | | Original transaction amount |
| `final_amount` | DECIMAL(10, 2) | | Final amount after discount |
| `used_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Usage timestamp |

**Relationships**:
- Many-to-one: `offer_id` → `offers.id`
- Many-to-one: `member_id` → `members.id`
- Many-to-one: `vendor_id` → `vendors.id`
- Many-to-one: `nfc_tap_log_id` → `nfc_tap_logs.id`

---

### 10. `admin_users` - Admin User Accounts

**Purpose**: Stores admin user credentials and roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing admin ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Admin email |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `full_name` | VARCHAR(255) | | Admin full name |
| `role` | VARCHAR(50) | DEFAULT 'admin' | 'admin', 'super_admin', 'operator' |
| `is_active` | BOOLEAN | DEFAULT true | Account active status |
| `last_login` | TIMESTAMP | | Last login timestamp |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |

---

### 11. `audit_logs` - Comprehensive Audit Trail

**Purpose**: Complete audit trail for all system actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing log ID |
| `user_type` | VARCHAR(50) | | 'admin', 'system', 'api' |
| `user_id` | INTEGER | | User ID (if applicable) |
| `action` | VARCHAR(100) | NOT NULL | Action performed |
| `resource_type` | VARCHAR(100) | | 'member', 'card', 'vendor', 'offer', etc. |
| `resource_id` | INTEGER | | Resource ID affected |
| `details` | JSONB | | Additional action details |
| `ip_address` | VARCHAR(50) | | Request IP address |
| `user_agent` | TEXT | | User agent string |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Action timestamp |

**Usage**: Complete audit trail for compliance, debugging, and security analysis.

## Data Relationships Summary

### Primary Relationships

1. **Members → NFC Cards**: One-to-many
   - A member can have multiple cards (primary + backup)
   - Cards are linked to members via `member_id`

2. **Members → Tap Logs**: One-to-many
   - Every tap is logged with member information
   - Used for fraud detection and analytics

3. **Vendors → POS Readers**: One-to-many
   - Each vendor can have multiple POS/NFC readers
   - Readers are location-specific

4. **Vendors → Tap Logs**: One-to-many
   - All taps are associated with a vendor
   - Used for vendor analytics

5. **Offers → Offer Usage**: One-to-many
   - Tracks how many times each offer is used
   - Enforces usage limits

6. **Members → Fraud Events**: One-to-many
   - Multiple fraud events can be associated with a member
   - Tracks fraud history

### Referential Integrity

- **CASCADE DELETE**: 
  - Deleting a member deletes their NFC cards
  - Deleting a vendor deletes their POS readers

- **Foreign Key Constraints**: 
  - All foreign keys are properly indexed
  - Prevents orphaned records

## Index Strategy

### Performance Indexes

1. **Member Lookups**: `email`, `membership_status`, `fraud_status`
2. **Card Lookups**: `card_uid`, `member_id`, `card_status`
3. **Tap Log Analytics**: `member_id`, `card_uid`, `vendor_id`, `tap_timestamp`
4. **Fraud Detection**: `member_id`, `severity`, `created_at`
5. **Offer Queries**: `is_active`, `membership_type`, `country_code`

### Composite Indexes (Future Optimization)

Consider adding composite indexes for common query patterns:
- `(member_id, tap_timestamp)` for member history queries
- `(vendor_id, tap_timestamp)` for vendor analytics
- `(card_uid, tap_timestamp)` for card usage patterns

## Data Types Best Practices

1. **Timestamps**: Use `TIMESTAMP` (with timezone awareness)
2. **Monetary Values**: Use `DECIMAL(10, 2)` for precision
3. **Percentages**: Use `DECIMAL(5, 2)` for discount percentages
4. **Arrays**: Use `TEXT[]` for simple lists (membership types)
5. **Flexible Data**: Use `JSONB` for complex nested structures
6. **Unique Identifiers**: Use `VARCHAR` with UNIQUE constraints

## Migration Strategy

1. **Initial Schema**: Run `database/schema.sql` to create all tables
2. **Indexes**: Created automatically with schema
3. **Future Migrations**: Add new columns/tables via migration scripts
4. **Data Migrations**: Use transactions for data updates

## Backup & Recovery

- **Backup Strategy**: Daily full backups + transaction logs
- **Point-in-Time Recovery**: Enabled via WAL (Write-Ahead Logging)
- **Retention**: 30 days of backups
- **Critical Tables**: `members`, `nfc_cards`, `nfc_tap_logs`, `fraud_events`

## Security Considerations

1. **Sensitive Data**: 
   - Passwords: Hashed with bcrypt
   - NFC Tokens: Encrypted before storage
   - No plaintext sensitive data

2. **Access Control**:
   - Database user with limited privileges
   - Connection pooling with max connections
   - Parameterized queries (SQL injection prevention)

3. **Audit Trail**:
   - All admin actions logged
   - All fraud events tracked
   - Complete tap history maintained

## Performance Optimization

1. **Connection Pooling**: Max 20 connections, idle timeout 30s
2. **Query Optimization**: All foreign keys indexed
3. **Partitioning** (Future): Consider partitioning `nfc_tap_logs` by date
4. **Archiving** (Future): Archive old tap logs (>1 year) to separate table

## Sample Queries

### Get Member with Cards
```sql
SELECT m.*, c.card_uid, c.card_status
FROM members m
LEFT JOIN nfc_cards c ON m.id = c.member_id
WHERE m.email = 'member@example.com';
```

### Fraud Events by Member
```sql
SELECT f.*, m.email, m.full_name
FROM fraud_events f
JOIN members m ON f.member_id = m.id
WHERE f.member_id = 1
ORDER BY f.created_at DESC;
```

### Vendor Analytics
```sql
SELECT 
  v.vendor_name,
  COUNT(t.id) as total_taps,
  COUNT(DISTINCT t.member_id) as unique_members,
  AVG(t.fraud_score) as avg_fraud_score
FROM vendors v
LEFT JOIN nfc_tap_logs t ON v.id = t.vendor_id
WHERE t.tap_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY v.id, v.vendor_name;
```

### Active Offers for Member
```sql
SELECT o.*
FROM offers o
WHERE o.is_active = true
  AND (o.membership_type IS NULL OR o.membership_type = 'annual')
  AND (o.valid_from IS NULL OR o.valid_from <= NOW())
  AND (o.valid_until IS NULL OR o.valid_until >= NOW())
ORDER BY o.priority DESC;
```

---

**Last Updated**: 2025-01-XX
**Database Version**: PostgreSQL 12+
**Schema Version**: 1.0.0


