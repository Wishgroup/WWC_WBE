/**
 * Migration: Add profile_icon_style (optional) to admin_users, members, vendors.
 * Enables PUT /api/auth/profile-icon. Run when profile icon preference is needed.
 * Risk: Low (additive only).
 */

import { query } from '../../database/connection.js';

const ER_DUP_FIELDNAME = 'ER_DUP_FIELDNAME';

export async function up() {
  for (const table of ['admin_users', 'members', 'vendors']) {
    try {
      await query(
        `ALTER TABLE ${table} ADD COLUMN profile_icon_style VARCHAR(50) NULL DEFAULT 'initials'`
      );
      console.log(`  Added profile_icon_style to ${table}`);
    } catch (e) {
      if (e.code !== ER_DUP_FIELDNAME && !/duplicate column/i.test(e.message)) throw e;
    }
  }
}

export async function down() {
  for (const table of ['admin_users', 'members', 'vendors']) {
    try {
      await query(`ALTER TABLE ${table} DROP COLUMN profile_icon_style`);
    } catch (e) {
      if (e.code !== 'ER_BAD_FIELD_ERROR') throw e;
    }
  }
}

const isMain = process.argv[1]?.endsWith('006-profile-icon-style.js');
if (isMain) {
  up()
    .then(() => { console.log('✅ 006-profile-icon-style up done'); process.exit(0); })
    .catch((e) => { console.error(e); process.exit(1); });
}
