-- Phase 3 Migration: Cards Module - DESFire EV2 Credentials
-- Adds secure credential structure with payload and signature

-- Extend nfc_cards table with DESFire EV2 credential fields
ALTER TABLE nfc_cards 
ADD COLUMN IF NOT EXISTS card_public_id VARCHAR(100) UNIQUE COMMENT 'Public card identifier (not UID)',
ADD COLUMN IF NOT EXISTS member_public_id VARCHAR(100) COMMENT 'Public member identifier',
ADD COLUMN IF NOT EXISTS payload TEXT COMMENT 'JSON payload stored on card',
ADD COLUMN IF NOT EXISTS signature VARCHAR(255) COMMENT 'HMAC-SHA256 signature of payload',
ADD COLUMN IF NOT EXISTS key_version INT DEFAULT 1 COMMENT 'Key version for signature rotation',
ADD COLUMN IF NOT EXISTS tier VARCHAR(50) COMMENT 'Membership tier (annual, lifetime)',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL COMMENT 'Card expiration timestamp',
ADD COLUMN IF NOT EXISTS nonce VARCHAR(100) COMMENT 'Unique nonce for this credential',
ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP NULL COMMENT 'Credential issuance timestamp';

-- Create index on card_public_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_nfc_cards_public_id ON nfc_cards(card_public_id);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_member_public_id ON nfc_cards(member_public_id);

-- Add public_id to members table for card payload
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS public_id VARCHAR(100) UNIQUE COMMENT 'Public member identifier for card credentials';

-- Create index on members.public_id
CREATE INDEX IF NOT EXISTS idx_members_public_id ON members(public_id);

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




