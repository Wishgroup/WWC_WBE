/**
 * Run all refactor migrations in order.
 * Requires: backend/.env with valid DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.
 * Usage: node scripts/run-all-migrations.js  (or npm run migrate:all)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const migrationScripts = [
  '001-vendor-status-fields.js',
  '002-cards-and-sessions.js',
  '003-nfc-validations-redemptions-pos.js',
  '004-notifications-outbox.js',
  '005-events.js',
  '006-profile-icon-style.js',
];

function run(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'migrations', scriptName);
    const child = spawn(process.execPath, [scriptPath], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${scriptName} exited ${code}`))));
    child.on('error', reject);
  });
}

async function main() {
  console.log('Running all migrations (vendor-status → cards → nfc → outbox → events → profile-icon)...\n');
  for (const scriptName of migrationScripts) {
    console.log(`\n--- ${scriptName} ---`);
    await run(scriptName);
  }
  console.log('\n✅ All migrations completed.');
}

main().catch((err) => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
