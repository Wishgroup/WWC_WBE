/**
 * Migration: notifications_outbox for email/SMS jobs.
 * Phase 6. Run: node scripts/migrations/004-notifications-outbox.js
 */

import { query } from '../../database/connection.js';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS notifications_outbox (
      id INT AUTO_INCREMENT PRIMARY KEY,
      channel VARCHAR(32) NOT NULL,
      type VARCHAR(64) NOT NULL,
      recipient VARCHAR(255),
      member_id INT NULL,
      payload JSON,
      status VARCHAR(32) DEFAULT 'pending',
      provider_ref VARCHAR(255),
      error_text TEXT,
      sent_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_created (created_at),
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function down() {
  await query('DROP TABLE IF EXISTS notifications_outbox');
}

const isMain = process.argv[1]?.endsWith('004-notifications-outbox.js');
if (isMain) {
  up().then(() => { console.log('✅ 004-notifications-outbox up done'); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });
}
