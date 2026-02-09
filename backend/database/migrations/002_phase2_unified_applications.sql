-- Phase 2 Migration: Unified Applications + Admin Approval Queue
-- Adds vendor status fields and vendor_applications table

-- Add vendor_status and payment fields to vendors table (one column per statement for MySQL 5.7)
ALTER TABLE vendors ADD COLUMN vendor_status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, active, rejected, expired';
ALTER TABLE vendors ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, success, paid, failed';
ALTER TABLE vendors ADD COLUMN payment_amount DECIMAL(10, 2) DEFAULT NULL;

-- Create index on vendor_status for faster queries (plain CREATE INDEX for MySQL 5.7 compatibility)
CREATE INDEX idx_vendors_vendor_status ON vendors(vendor_status);
CREATE INDEX idx_vendors_payment_status ON vendors(payment_status);

-- Create vendor_applications table
CREATE TABLE IF NOT EXISTS vendor_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(100) UNIQUE,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'AED',
    business_address TEXT,
    contact_phone VARCHAR(50),
    business_license VARCHAR(255),
    tax_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, approved, rejected',
    payment_status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, success, paid, failed',
    payment_amount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    order_id VARCHAR(255) UNIQUE,
    rejection_reason TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add application_type to membership_applications to support unified view
ALTER TABLE membership_applications ADD COLUMN application_type VARCHAR(50) DEFAULT 'member' COMMENT 'member, vendor';

-- Create index on application_type
CREATE INDEX idx_membership_applications_type ON membership_applications(application_type);





