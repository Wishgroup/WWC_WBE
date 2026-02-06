-- Phase 6 Migration: Notifications Outbox + Worker
-- Creates notifications_outbox table for async notification processing

CREATE TABLE IF NOT EXISTS notifications_outbox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel VARCHAR(50) NOT NULL COMMENT 'email, sms',
    recipient VARCHAR(255) NOT NULL COMMENT 'Email address or phone number',
    template VARCHAR(100) NOT NULL COMMENT 'Template name (redeem_success, event_checkin)',
    data JSON COMMENT 'Template variables',
    status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, sent, failed',
    attempts INT DEFAULT 0,
    last_attempt_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_channel (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




