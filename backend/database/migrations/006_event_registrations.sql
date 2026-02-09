-- Migration: Event Registrations Table
-- Adds event_registrations table for member event registration

CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    member_id INT NOT NULL,
    registration_status VARCHAR(50) DEFAULT 'registered' COMMENT 'registered, cancelled, attended, no_show',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_member (event_id, member_id),
    INDEX idx_event_id (event_id),
    INDEX idx_member_id (member_id),
    INDEX idx_registration_status (registration_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

