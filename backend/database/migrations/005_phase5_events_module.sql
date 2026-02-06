-- Phase 5 Migration: Events Module
-- Adds events, event_rules, and event_checkins tables

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    max_capacity INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_event_code (event_code),
    INDEX idx_start_time (start_time),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create event_rules table
CREATE TABLE IF NOT EXISTS event_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    allowed_tiers JSON COMMENT 'Array of allowed membership tiers',
    time_window_start TIME COMMENT 'Start time for check-in window',
    time_window_end TIME COMMENT 'End time for check-in window',
    allow_multiple_entry BOOLEAN DEFAULT false COMMENT 'Allow multiple check-ins',
    anti_passback_minutes INT DEFAULT 0 COMMENT 'Minutes to prevent re-entry (0 = disabled)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create event_checkins table
CREATE TABLE IF NOT EXISTS event_checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    member_id INT NOT NULL,
    card_public_id VARCHAR(100) COMMENT 'Card public ID (Phase 3)',
    card_uid VARCHAR(100) COMMENT 'Card UID (legacy/audit)',
    tier VARCHAR(50) COMMENT 'Membership tier at time of check-in',
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_member_id (member_id),
    INDEX idx_checkin_time (checkin_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add unique constraint for anti-passback (if enabled)
-- Note: This will be added conditionally based on event rules
-- For now, we'll handle anti-passback in application logic




