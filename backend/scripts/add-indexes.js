/**
 * Add composite indexes for NFC validation and fraud queries (sub-second lookups)
 * Run: node scripts/add-indexes.js
 */

import { query } from '../database/connection.js';

const indexes = [
  {
    name: 'idx_nfc_tap_member_time',
    table: 'nfc_tap_logs',
    sql: 'CREATE INDEX idx_nfc_tap_member_time ON nfc_tap_logs (member_id, tap_timestamp DESC)',
  },
  {
    name: 'idx_nfc_tap_vendor_time',
    table: 'nfc_tap_logs',
    sql: 'CREATE INDEX idx_nfc_tap_vendor_time ON nfc_tap_logs (vendor_id, tap_timestamp DESC)',
  },
  {
    name: 'idx_audit_created',
    table: 'audit_logs',
    sql: 'CREATE INDEX idx_audit_created ON audit_logs (created_at DESC)',
  },
];

async function addIndexes() {
  for (const idx of indexes) {
    try {
      await query(idx.sql);
      console.log(`✅ Created index ${idx.name} on ${idx.table}`);
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME' || e.message?.includes('Duplicate key')) {
        console.log(`⏭️  Index ${idx.name} already exists`);
      } else {
        console.error(`❌ ${idx.name}:`, e.message);
      }
    }
  }
}

addIndexes()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
