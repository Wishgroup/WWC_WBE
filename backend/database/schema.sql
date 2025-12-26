-- Wish Waves Club Database Schema
-- Enterprise Features: Fraud Detection, Multi-Country Rules, Dynamic Offers

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    membership_type VARCHAR(50) NOT NULL, -- 'annual', 'lifetime'
    membership_status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'suspended', 'cancelled'
    subscription_start_date TIMESTAMP NOT NULL,
    subscription_end_date TIMESTAMP,
    payment_amount DECIMAL(10, 2),
    payment_status VARCHAR(50),
    referral_code VARCHAR(50) UNIQUE,
    referred_by INTEGER REFERENCES members(id),
    fraud_score INTEGER DEFAULT 0,
    fraud_status VARCHAR(50) DEFAULT 'clean', -- 'clean', 'monitored', 'restricted', 'blocked'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFC Cards Table
CREATE TABLE IF NOT EXISTS nfc_cards (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    card_uid VARCHAR(100) UNIQUE NOT NULL,
    encrypted_token TEXT NOT NULL,
    card_status VARCHAR(50) DEFAULT 'active', -- 'active', 'blocked', 'expired', 'lost', 'stolen', 'damaged', 'blacklisted'
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_at TIMESTAMP,
    expiry_date TIMESTAMP,
    is_primary BOOLEAN DEFAULT true,
    previous_uid VARCHAR(100), -- For reissued cards
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    category VARCHAR(100), -- 'restaurant', 'wellness', 'retail', 'travel', etc.
    allowed_membership_tiers TEXT[], -- Array of allowed membership types
    max_discount_percentage DECIMAL(5, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    compliance_status VARCHAR(50) DEFAULT 'compliant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS / NFC Readers Table
CREATE TABLE IF NOT EXISTS pos_readers (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    reader_id VARCHAR(100) UNIQUE NOT NULL,
    reader_name VARCHAR(255),
    location_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Country Rules Table
CREATE TABLE IF NOT EXISTS country_rules (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(10) UNIQUE NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    allowed_membership_types TEXT[] NOT NULL,
    max_discount_percentage DECIMAL(5, 2) NOT NULL,
    tax_rules JSONB, -- Flexible tax configuration
    compliance_restrictions JSONB, -- Legal/compliance rules
    blackout_periods JSONB, -- Time-based restrictions
    currency VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFC Tap Logs (Fraud Detection Data)
CREATE TABLE IF NOT EXISTS nfc_tap_logs (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id),
    card_uid VARCHAR(100) NOT NULL,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id),
    vendor_country VARCHAR(100) NOT NULL,
    vendor_city VARCHAR(100) NOT NULL,
    pos_reader_id VARCHAR(100) NOT NULL,
    tap_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    fraud_score INTEGER DEFAULT 0,
    fraud_flags TEXT[], -- Array of detected fraud indicators
    validation_result VARCHAR(50), -- 'approved', 'rejected', 'restricted'
    offer_applied JSONB, -- Dynamic offer details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fraud Events Table
CREATE TABLE IF NOT EXISTS fraud_events (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    card_uid VARCHAR(100),
    vendor_id INTEGER REFERENCES vendors(id),
    event_type VARCHAR(100) NOT NULL, -- 'geo_inconsistency', 'excessive_taps', 'country_mismatch', 'expired_access', 'cloning_attempt'
    severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high'
    fraud_score INTEGER NOT NULL,
    description TEXT,
    metadata JSONB, -- Additional event data
    action_taken VARCHAR(100), -- 'logged', 'soft_restriction', 'card_blocked', 'admin_alert'
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by INTEGER, -- Admin user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Offers Table
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    offer_code VARCHAR(100) UNIQUE,
    offer_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount', 'free_addon', 'vip_access', 'event_access', 'flash'
    membership_type VARCHAR(50), -- NULL = all types
    vendor_category VARCHAR(100), -- NULL = all categories
    country_code VARCHAR(10), -- NULL = all countries
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    time_restrictions JSONB, -- Day/time restrictions
    usage_limit INTEGER, -- Max uses per member
    priority INTEGER DEFAULT 0, -- Higher = more priority
    is_active BOOLEAN DEFAULT true,
    conditions JSONB, -- Additional conditions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offer Usage Logs
CREATE TABLE IF NOT EXISTS offer_usage_logs (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id),
    member_id INTEGER NOT NULL REFERENCES members(id),
    vendor_id INTEGER NOT NULL REFERENCES vendors(id),
    nfc_tap_log_id INTEGER REFERENCES nfc_tap_logs(id),
    discount_amount DECIMAL(10, 2),
    original_amount DECIMAL(10, 2),
    final_amount DECIMAL(10, 2),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'super_admin', 'operator'
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(50), -- 'admin', 'system', 'api'
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100), -- 'member', 'card', 'vendor', 'offer', etc.
    resource_id INTEGER,
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_membership_status ON members(membership_status);
CREATE INDEX IF NOT EXISTS idx_members_fraud_status ON members(fraud_status);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_uid ON nfc_cards(card_uid);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_member_id ON nfc_cards(member_id);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_status ON nfc_cards(card_status);
CREATE INDEX IF NOT EXISTS idx_nfc_tap_logs_member_id ON nfc_tap_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_nfc_tap_logs_card_uid ON nfc_tap_logs(card_uid);
CREATE INDEX IF NOT EXISTS idx_nfc_tap_logs_vendor_id ON nfc_tap_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_nfc_tap_logs_timestamp ON nfc_tap_logs(tap_timestamp);
CREATE INDEX IF NOT EXISTS idx_fraud_events_member_id ON fraud_events(member_id);
CREATE INDEX IF NOT EXISTS idx_fraud_events_severity ON fraud_events(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_events_created_at ON fraud_events(created_at);
CREATE INDEX IF NOT EXISTS idx_vendors_country ON vendors(country);
CREATE INDEX IF NOT EXISTS idx_vendors_code ON vendors(vendor_code);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_membership_type ON offers(membership_type);
CREATE INDEX IF NOT EXISTS idx_offers_country_code ON offers(country_code);





