/**
 * Migration: Add cards and card_issue_sessions tables for DESFire EV2 credential issuance.
 * Phase 3 - Card identity is card_public_id; UID optional for audit only.
 * Run from backend: node scripts/migrations/002-cards-and-sessions.js
 * Risk: Low (additive).
 */

import { query } from '../../database/connection.js';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS card_issue_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      member_id INT NOT NULL,
      issue_session_id VARCHAR(64) UNIQUE NOT NULL,
      card_public_id VARCHAR(64) NOT NULL,
      payload TEXT,
      signature VARCHAR(512),
      key_version INT NOT NULL DEFAULT 1,
      expires_at TIMESTAMP NOT NULL,
      status VARCHAR(32) DEFAULT 'prepared',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      INDEX idx_issue_session_id (issue_session_id),
      INDEX idx_member_id (member_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      member_id INT NOT NULL,
      card_public_id VARCHAR(64) UNIQUE NOT NULL,
      card_uid VARCHAR(100) NULL,
      key_version INT NOT NULL DEFAULT 1,
      tier VARCHAR(50) NOT NULL DEFAULT 'annual',
      expires_at TIMESTAMP NULL,
      status VARCHAR(32) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      INDEX idx_card_public_id (card_public_id),
      INDEX idx_member_id (member_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function down() {
  await query('DROP TABLE IF EXISTS cards');
  await query('DROP TABLE IF EXISTS card_issue_sessions');
}

const isMain = process.argv[1]?.endsWith('002-cards-and-sessions.js');
if (isMain) {
  up()
    .then(() => { console.log('✅ 002-cards-and-sessions up done'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
