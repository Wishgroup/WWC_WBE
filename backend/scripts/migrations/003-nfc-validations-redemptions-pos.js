/**
 * Migration: nfc_validations, redemptions; pos_readers.device_key_hash for POS device auth.
 * Phase 4. Run: node scripts/migrations/003-nfc-validations-redemptions-pos.js
 */

import { query } from '../../database/connection.js';

export async function up() {
  try {
    await query(`ALTER TABLE pos_readers ADD COLUMN device_key_hash VARCHAR(64) NULL`);
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME' && !/duplicate column/i.test(e.message)) throw e;
  }

  await query(`
    CREATE TABLE IF NOT EXISTS nfc_validations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      validation_id VARCHAR(64) UNIQUE NOT NULL,
      member_id INT NOT NULL,
      vendor_id INT NOT NULL,
      pos_reader_id VARCHAR(100) NOT NULL,
      card_public_id VARCHAR(64) NOT NULL,
      offer_snapshot JSON,
      amount DECIMAL(10, 2),
      currency VARCHAR(10),
      expires_at TIMESTAMP NOT NULL,
      redeemed TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      INDEX idx_validation_id (validation_id),
      INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS redemptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      validation_id VARCHAR(64) NOT NULL,
      vendor_id INT NOT NULL,
      invoice_id VARCHAR(128) NOT NULL,
      member_id INT NOT NULL,
      final_amount DECIMAL(10, 2) NOT NULL,
      discount_applied DECIMAL(10, 2) DEFAULT 0,
      currency VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_vendor_invoice (vendor_id, invoice_id),
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (vendor_id) REFERENCES vendors(id),
      INDEX idx_validation_id (validation_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function down() {
  await query('DROP TABLE IF EXISTS redemptions');
  await query('DROP TABLE IF EXISTS nfc_validations');
  try {
    await query('ALTER TABLE pos_readers DROP COLUMN device_key_hash');
  } catch (_) {}
}

const isMain = process.argv[1]?.endsWith('003-nfc-validations-redemptions-pos.js');
if (isMain) {
  up().then(() => { console.log('✅ 003-nfc-validations-redemptions-pos up done'); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });
}
