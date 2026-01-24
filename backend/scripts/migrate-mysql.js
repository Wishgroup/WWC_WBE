/**
 * MySQL Database Migration Script
 * Run this to set up the database schema on tashjeel.ae
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'wwc_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true, // Allow multiple SQL statements
};

async function migrate() {
  let connection;
  try {
    console.log('🔄 Starting MySQL database migration...');
    console.log(`📡 Connecting to ${dbConfig.host}:${dbConfig.port}...`);

    // Step 1: Connect without database to create it if needed
    const connectionConfig = {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true,
    };

    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to MySQL server');

    // Step 2: Create database if it doesn't exist
    console.log(`📦 Creating database '${dbConfig.database}' if it doesn't exist...`);
    try {
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Database '${dbConfig.database}' is ready`);
    } catch (error) {
      if (error.code === 'ER_DB_CREATE_EXISTS' || error.message.includes('already exists')) {
        console.log(`⚠️  Database '${dbConfig.database}' already exists`);
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.message.includes('Access denied')) {
        console.log(`⚠️  Cannot create database (insufficient privileges). Assuming database exists...`);
        console.log(`   If the database doesn't exist, please create it manually in cPanel first.`);
      } else {
        throw error;
      }
    }

    // Step 3: Select the database
    await connection.execute(`USE \`${dbConfig.database}\``);
    console.log(`✅ Using database '${dbConfig.database}'`);

    // Read schema file
    const schemaPath = join(__dirname, '../database/mysql-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`  ✓ Statement ${i + 1}/${statements.length} executed`);
        } catch (error) {
          // Ignore "table already exists" errors
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('already exists')) {
            console.log(`  ⚠ Statement ${i + 1} skipped (table already exists)`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n✅ Database migration completed successfully!');
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
    console.log('  - payment_sessions');
    console.log('  - membership_applications');
    console.log('  - audit_logs');
    console.log('\n✨ Ready to use!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrate();

