-- Migration: Bank Transfer Payment Support
-- Adds bank transfer payment method with receipt upload functionality

-- Add bank transfer receipt fields to payment_sessions table
-- Note: MySQL doesn't support IF NOT EXISTS in ALTER TABLE, so check manually or use separate queries
ALTER TABLE payment_sessions 
ADD COLUMN payment_method VARCHAR(50) DEFAULT 'ccavenue' COMMENT 'Payment method: ccavenue, bank_transfer';

ALTER TABLE payment_sessions 
ADD COLUMN receipt_path VARCHAR(500) NULL COMMENT 'Path to uploaded bank receipt';

ALTER TABLE payment_sessions 
ADD COLUMN receipt_filename VARCHAR(255) NULL COMMENT 'Stored filename of receipt';

ALTER TABLE payment_sessions 
ADD COLUMN receipt_original_name VARCHAR(255) NULL COMMENT 'Original filename of receipt';

ALTER TABLE payment_sessions 
ADD COLUMN receipt_mime_type VARCHAR(100) NULL COMMENT 'MIME type of receipt file';

ALTER TABLE payment_sessions 
ADD COLUMN receipt_size INT NULL COMMENT 'Size of receipt file in bytes';

-- Create bank_transfer_receipts table
CREATE TABLE IF NOT EXISTS bank_transfer_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    receipt_path VARCHAR(500) NOT NULL,
    receipt_filename VARCHAR(255) NOT NULL,
    receipt_original_name VARCHAR(255) NOT NULL,
    receipt_mime_type VARCHAR(100) NOT NULL,
    receipt_size INT NOT NULL,
    status ENUM('pending_verification', 'verified', 'rejected') DEFAULT 'pending_verification',
    verified_by INT NULL COMMENT 'Admin user ID who verified',
    verified_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    -- Note: Foreign key constraint may fail if payment_sessions.order_id is not indexed properly
    -- If foreign key creation fails, the table will still work without it
    -- FOREIGN KEY (order_id) REFERENCES payment_sessions(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update membership_applications table to include payment method
ALTER TABLE membership_applications
ADD COLUMN payment_method VARCHAR(50) DEFAULT 'ccavenue' COMMENT 'Payment method used';

-- Add index if it doesn't exist (check manually)
-- CREATE INDEX idx_payment_method ON membership_applications(payment_method);

-- Update payment_sessions to support pending_verification status
ALTER TABLE payment_sessions
MODIFY COLUMN payment_status VARCHAR(50) DEFAULT 'pending' COMMENT 'Payment status: pending, completed, failed, pending_verification, verified, rejected';

