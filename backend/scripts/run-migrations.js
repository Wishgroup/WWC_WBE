/**
 * Run all database migrations
 * Executes SQL migration files in order
 * Loads .env from backend root so DB credentials work when run from Terminal (e.g. cPanel).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root before any DB connection (required when run from cPanel Terminal)
const backendRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(backendRoot, '.env') });

const migrationsDir = path.join(__dirname, '../database/migrations');

async function runMigrations() {
  if (!process.env.DB_PASSWORD || !process.env.DB_USER) {
    console.error('❌ Missing DB credentials. Create a .env file in the backend folder (same folder as server.js) with:');
    console.error('   DB_HOST=localhost');
    console.error('   DB_USER=your_db_user');
    console.error('   DB_PASSWORD=your_db_password');
    console.error('   DB_NAME=your_db_name');
    console.error('\n   When using cPanel Terminal, .env is required; the Node.js app UI env vars are not used by this script.\n');
    process.exit(1);
  }

  const { query } = await import('../database/connection.js');

  try {
    console.log('🔄 Starting database migrations...\n');

    // Get all migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure order

    console.log(`Found ${files.length} migration files:\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`📄 Running: ${file}`);

      try {
        // Split by semicolon and execute each statement
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            await query(statement);
          }
        }

        console.log(`✅ Completed: ${file}\n`);
      } catch (error) {
        // Skip if object already exists (idempotent migrations)
        if (error.code === 'ER_TABLE_EXISTS_ERROR' ||
            error.code === 'ER_DUP_KEYNAME' ||
            error.message.includes('Duplicate column name') ||
            error.message.includes('Duplicate key name') ||
            error.message.includes('already exists')) {
          console.log(`⚠️  Skipped (already applied): ${file}\n`);
        } else {
          console.error(`❌ Error in ${file}:`, error.message);
          throw error;
        }
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();




