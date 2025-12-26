/**
 * Database Migration Script
 * Run this to set up the database schema
 */

import pkg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wwc_db',
  user: process.env.DB_USER || 'wwc_user',
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    // Read schema file
    const schemaPath = join(__dirname, '../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Database migration completed successfully!');
    console.log('\n📊 Database tables created:');
    console.log('  - members');
    console.log('  - nfc_cards');
    console.log('  - vendors');
    console.log('  - pos_readers');
    console.log('  - country_rules');
    console.log('  - nfc_tap_logs');
    console.log('  - fraud_events');
    console.log('  - offers');
    console.log('  - offer_usage_logs');
    console.log('  - admin_users');
    console.log('  - audit_logs');
    console.log('\n✨ Ready to use!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();





