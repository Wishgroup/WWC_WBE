/**
 * Migration: Add vendor_status and payment_status to vendors table.
 * Phase 1 - Unified status model for vendor lifecycle.
 * Run from backend: node scripts/migrations/001-vendor-status-fields.js
 * What: Adds vendor_status, payment_status; backfills existing vendors as active/paid.
 * Risk: Low (additive only).
 */

import { query } from '../../database/connection.js';

const ER_DUP_FIELDNAME = 'ER_DUP_FIELDNAME';

export async function up() {
  try {
    await query(`ALTER TABLE vendors ADD COLUMN vendor_status VARCHAR(50) DEFAULT 'pending'`);
  } catch (e) {
    if (e.code !== ER_DUP_FIELDNAME && !/duplicate column/i.test(e.message)) throw e;
  }
  try {
    await query(`ALTER TABLE vendors ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'`);
  } catch (e) {
    if (e.code !== ER_DUP_FIELDNAME && !/duplicate column/i.test(e.message)) throw e;
  }
  const r = await query(
    `UPDATE vendors SET vendor_status = 'active', payment_status = 'paid' WHERE is_active = 1`
  );
  if (r.affectedRows > 0) {
    console.log(`  Backfilled ${r.affectedRows} vendor(s) as active/paid`);
  }
}

export async function down() {
  await query(`ALTER TABLE vendors DROP COLUMN vendor_status`);
  await query(`ALTER TABLE vendors DROP COLUMN payment_status`);
}

const isMain = process.argv[1]?.endsWith('001-vendor-status-fields.js');
if (isMain) {
  up()
    .then(() => { console.log('✅ 001-vendor-status-fields up done'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
