-- Phase 4 Migration: NFC Validate/Redeem with POS Device Auth
-- Adds redemptions table and POS device authentication

-- Add device authentication fields to pos_readers
ALTER TABLE pos_readers 
ADD COLUMN IF NOT EXISTS device_key_hash VARCHAR(255) COMMENT 'Hashed device key for authentication',
ADD COLUMN IF NOT EXISTS device_name VARCHAR(255) COMMENT 'Device friendly name',
ADD COLUMN IF NOT EXISTS device_type VARCHAR(50) DEFAULT 'mini-pc' COMMENT 'android, mini-pc';

-- Create index on device_key_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_pos_readers_device_key ON pos_readers(device_key_hash);

-- Create redemptions table (idempotent via unique constraint)
CREATE TABLE IF NOT EXISTS redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    member_id INT NOT NULL,
    card_public_id VARCHAR(100) COMMENT 'Card public ID (Phase 3)',
    card_uid VARCHAR(100) COMMENT 'Card UID (legacy/audit)',
    invoice_id VARCHAR(255) NOT NULL COMMENT 'Unique invoice ID from POS',
    amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    pos_reader_id VARCHAR(100) NOT NULL,
    offer_applied JSON COMMENT 'Offer details if any',
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vendor_invoice (vendor_id, invoice_id),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_member_id (member_id),
    INDEX idx_card_public_id (card_public_id),
    INDEX idx_redeemed_at (redeemed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Extend nfc_tap_logs with validation_type and invoice_id
ALTER TABLE nfc_tap_logs 
ADD COLUMN IF NOT EXISTS validation_type VARCHAR(50) DEFAULT 'validate' COMMENT 'validate, redeem',
ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(255) NULL COMMENT 'Invoice ID for redemptions';

-- Create index on validation_type
CREATE INDEX IF NOT EXISTS idx_nfc_tap_logs_validation_type ON nfc_tap_logs(validation_type);




