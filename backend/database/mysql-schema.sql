-- Wish Waves Club Database Schema (MySQL)
-- Enterprise Features: Fraud Detection, Multi-Country Rules, Dynamic Offers
-- Converted from PostgreSQL to MySQL syntax

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    mobile_number VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    address JSON,
    id_number VARCHAR(100),
    id_type VARCHAR(50),
    membership_type VARCHAR(50) NOT NULL DEFAULT 'annual', -- 'annual', 'lifetime'
    membership_status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'suspended', 'cancelled', 'pending'
    subscription_start_date TIMESTAMP NULL,
    subscription_end_date TIMESTAMP NULL,
    payment_amount DECIMAL(10, 2),
    payment_status VARCHAR(50),
    referral_code VARCHAR(50) UNIQUE,
    referred_by INT,
    fraud_score INT DEFAULT 0,
    fraud_status VARCHAR(50) DEFAULT 'clean', -- 'clean', 'monitored', 'restricted', 'blocked'
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_membership_status (membership_status),
    INDEX idx_fraud_status (fraud_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NFC Cards Table
CREATE TABLE IF NOT EXISTS nfc_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    card_uid VARCHAR(100) UNIQUE NOT NULL,
    encrypted_token TEXT NOT NULL,
    card_status VARCHAR(50) DEFAULT 'active', -- 'active', 'blocked', 'expired', 'lost', 'stolen', 'damaged', 'blacklisted'
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_at TIMESTAMP NULL,
    expiry_date TIMESTAMP NULL,
    is_primary BOOLEAN DEFAULT true,
    previous_uid VARCHAR(100), -- For reissued cards
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_card_uid (card_uid),
    INDEX idx_member_id (member_id),
    INDEX idx_card_status (card_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    category VARCHAR(100), -- 'restaurant', 'wellness', 'retail', 'travel', etc.
    allowed_membership_tiers JSON, -- Array of allowed membership types stored as JSON
    max_discount_percentage DECIMAL(5, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    compliance_status VARCHAR(50) DEFAULT 'compliant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_country (country),
    INDEX idx_vendor_code (vendor_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- POS / NFC Readers Table
CREATE TABLE IF NOT EXISTS pos_readers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    reader_id VARCHAR(100) UNIQUE NOT NULL,
    reader_name VARCHAR(255),
    location_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Country Rules Table
CREATE TABLE IF NOT EXISTS country_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_code VARCHAR(10) UNIQUE NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    allowed_membership_types JSON NOT NULL, -- Array stored as JSON
    max_discount_percentage DECIMAL(5, 2) NOT NULL,
    tax_rules JSON, -- Flexible tax configuration
    compliance_restrictions JSON, -- Legal/compliance rules
    blackout_periods JSON, -- Time-based restrictions
    currency VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NFC Tap Logs (Fraud Detection Data)
CREATE TABLE IF NOT EXISTS nfc_tap_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    card_uid VARCHAR(100) NOT NULL,
    vendor_id INT NOT NULL,
    vendor_country VARCHAR(100) NOT NULL,
    vendor_city VARCHAR(100) NOT NULL,
    pos_reader_id VARCHAR(100) NOT NULL,
    tap_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    fraud_score INT DEFAULT 0,
    fraud_flags JSON, -- Array of detected fraud indicators stored as JSON
    validation_result VARCHAR(50), -- 'approved', 'rejected', 'restricted'
    offer_applied JSON, -- Dynamic offer details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    INDEX idx_member_id (member_id),
    INDEX idx_card_uid (card_uid),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_tap_timestamp (tap_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fraud Events Table
CREATE TABLE IF NOT EXISTS fraud_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    card_uid VARCHAR(100),
    vendor_id INT,
    event_type VARCHAR(100) NOT NULL, -- 'geo_inconsistency', 'excessive_taps', 'country_mismatch', 'expired_access', 'cloning_attempt'
    severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high'
    fraud_score INT NOT NULL,
    description TEXT,
    metadata JSON, -- Additional event data
    action_taken VARCHAR(100), -- 'logged', 'soft_restriction', 'card_blocked', 'admin_alert'
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP NULL,
    resolved_by INT, -- Admin user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    INDEX idx_member_id (member_id),
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dynamic Offers Table
CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_code VARCHAR(100) UNIQUE,
    offer_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount', 'free_addon', 'vip_access', 'event_access', 'flash'
    membership_type VARCHAR(50), -- NULL = all types
    vendor_category VARCHAR(100), -- NULL = all categories
    country_code VARCHAR(10), -- NULL = all countries
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    valid_from TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    time_restrictions JSON, -- Day/time restrictions
    usage_limit INT, -- Max uses per member
    priority INT DEFAULT 0, -- Higher = more priority
    is_active BOOLEAN DEFAULT true,
    conditions JSON, -- Additional conditions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_offers_active (is_active),
    INDEX idx_offers_membership_type (membership_type),
    INDEX idx_offers_country_code (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Offer Usage Logs
CREATE TABLE IF NOT EXISTS offer_usage_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    member_id INT NOT NULL,
    vendor_id INT NOT NULL,
    nfc_tap_log_id INT,
    discount_amount DECIMAL(10, 2),
    original_amount DECIMAL(10, 2),
    final_amount DECIMAL(10, 2),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES offers(id),
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (nfc_tap_log_id) REFERENCES nfc_tap_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'super_admin', 'operator'
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Sessions Table
CREATE TABLE IF NOT EXISTS payment_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    member_id INT,
    email VARCHAR(255) NOT NULL,
    form_data JSON,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'AED',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    order_id VARCHAR(255),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_email (email),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Membership Applications Table
CREATE TABLE IF NOT EXISTS membership_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    nationality VARCHAR(100),
    gender VARCHAR(20),
    passport_id VARCHAR(100),
    mobile_number VARCHAR(50),
    address JSON,
    membership_type VARCHAR(50) NOT NULL,
    referral_code VARCHAR(50),
    referred_by VARCHAR(255),
    renewal_preference VARCHAR(50),
    occupation VARCHAR(255),
    company_name VARCHAR(255),
    industry VARCHAR(255),
    business_email VARCHAR(255),
    emergency_contact JSON,
    payment_method VARCHAR(50),
    amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'AED',
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type VARCHAR(50), -- 'admin', 'system', 'api'
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100), -- 'member', 'card', 'vendor', 'offer', etc.
    resource_id INT,
    details JSON,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_type (user_type),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Transfer Receipts Table
CREATE TABLE IF NOT EXISTS bank_transfer_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    payment_session_id INT,
    order_id VARCHAR(255),
    receipt_file_path VARCHAR(500) NOT NULL,
    receipt_file_name VARCHAR(255) NOT NULL,
    receipt_file_size INT,
    receipt_mime_type VARCHAR(100),
    upload_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected'
    admin_reviewed_by INT,
    admin_reviewed_at TIMESTAMP NULL,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (payment_session_id) REFERENCES payment_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_reviewed_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_member_id (member_id),
    INDEX idx_payment_session_id (payment_session_id),
    INDEX idx_upload_status (upload_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;







