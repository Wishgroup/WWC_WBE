-- Phase 3 Migration: Cards Module - DESFire EV2 Credentials
-- Adds secure credential structure with payload and signature

-- Extend nfc_cards table with DESFire EV2 credential fields (one per statement for MySQL 5.7)
ALTER TABLE nfc_cards ADD COLUMN card_public_id VARCHAR(100) UNIQUE COMMENT 'Public card identifier (not UID)';
ALTER TABLE nfc_cards ADD COLUMN member_public_id VARCHAR(100) COMMENT 'Public member identifier';
ALTER TABLE nfc_cards ADD COLUMN payload TEXT COMMENT 'JSON payload stored on card';
ALTER TABLE nfc_cards ADD COLUMN signature VARCHAR(255) COMMENT 'HMAC-SHA256 signature of payload';
ALTER TABLE nfc_cards ADD COLUMN key_version INT DEFAULT 1 COMMENT 'Key version for signature rotation';
ALTER TABLE nfc_cards ADD COLUMN tier VARCHAR(50) COMMENT 'Membership tier (annual, lifetime)';
ALTER TABLE nfc_cards ADD COLUMN expires_at TIMESTAMP NULL COMMENT 'Card expiration timestamp';
ALTER TABLE nfc_cards ADD COLUMN nonce VARCHAR(100) COMMENT 'Unique nonce for this credential';
ALTER TABLE nfc_cards ADD COLUMN issued_at TIMESTAMP NULL COMMENT 'Credential issuance timestamp';

-- Create index on card_public_id for fast lookups (plain CREATE INDEX for MySQL 5.7 compatibility)
CREATE INDEX idx_nfc_cards_public_id ON nfc_cards(card_public_id);
CREATE INDEX idx_nfc_cards_member_public_id ON nfc_cards(member_public_id);

-- Add public_id to members table for card payload
ALTER TABLE members ADD COLUMN public_id VARCHAR(100) UNIQUE COMMENT 'Public member identifier for card credentials';

-- Create index on members.public_id
CREATE INDEX idx_members_public_id ON members(public_id);

-- Create card_issue_sessions table for admin-driven issuance workflow
CREATE TABLE IF NOT EXISTS card_issue_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL COMMENT 'Unique session identifier',
    member_id INT NOT NULL,
    card_public_id VARCHAR(100) UNIQUE,
    payload TEXT COMMENT 'JSON payload to write to card',
    signature VARCHAR(255) COMMENT 'HMAC-SHA256 signature',
    key_version INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'prepared' COMMENT 'prepared, confirmed, failed',
    prepared_by INT COMMENT 'Admin user who prepared the session',
    confirmed_at TIMESTAMP NULL,
    card_uid VARCHAR(100) COMMENT 'Physical card UID (for audit only)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_member_id (member_id),
    INDEX idx_status (status),
    INDEX idx_card_public_id (card_public_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





