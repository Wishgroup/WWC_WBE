/**
 * Migration: events, event_rules, event_checkins for card check-in.
 * Phase 5. Run: node scripts/migrations/005-events.js
 */

import { query } from '../../database/connection.js';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_code VARCHAR(64) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      start_at TIMESTAMP NOT NULL,
      end_at TIMESTAMP NOT NULL,
      timezone VARCHAR(50) DEFAULT 'UTC',
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_event_code (event_code),
      INDEX idx_start_at (start_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS event_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      rule_type VARCHAR(64) NOT NULL,
      config JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      INDEX idx_event_id (event_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS event_checkins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      member_id INT NOT NULL,
      card_public_id VARCHAR(64) NOT NULL,
      device_reader_id VARCHAR(100),
      checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_event_member (event_id, member_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      INDEX idx_event_id (event_id),
      INDEX idx_member_id (member_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function down() {
  await query('DROP TABLE IF EXISTS event_checkins');
  await query('DROP TABLE IF EXISTS event_rules');
  await query('DROP TABLE IF EXISTS events');
}

const isMain = process.argv[1]?.endsWith('005-events.js');
if (isMain) {
  up().then(() => { console.log('✅ 005-events up done'); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });
}
