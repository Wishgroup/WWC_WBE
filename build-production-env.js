/**
 * Production Environment Builder
 * Creates production-ready .env files with API URL configuration
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function buildProductionEnv() {
  console.log('🔧 Production Environment Configuration Builder\n');
  console.log('This will help you create production-ready environment files.\n');

  // Get production domain
  const domain = await question('Enter your production domain (e.g., https://yourdomain.com): ');
  if (!domain) {
    console.error('Domain is required');
    process.exit(1);
  }

  const apiUrl = domain.endsWith('/') ? `${domain}api` : `${domain}/api`;

  // Create frontend .env.production
  console.log('\n📝 Creating frontend .env.production...');
  const frontendEnv = `# Production Environment Variables
VITE_API_URL=${apiUrl}
`;
  writeFileSync(join(__dirname, '.env.production'), frontendEnv);
  console.log('   ✅ Created .env.production');
  console.log(`   API URL: ${apiUrl}\n`);

  // Create backend .env.production template
  console.log('📝 Creating backend .env.production template...');
  const backendEnvTemplate = `# Production Environment Variables
# Copy this to backend/.env and fill in your values

NODE_ENV=production
PORT=3001

# MySQL Database (tashjeel.ae)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Security (IMPORTANT: Generate secure values!)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
NFC_ENCRYPTION_KEY=your_nfc_encryption_key_32_bytes_min
NFC_TOKEN_SECRET=your_nfc_token_secret
ADMIN_API_KEY=your_admin_api_key_secure_random

# Frontend URL
FRONTEND_URL=${domain}

# Payment Gateway (CC Avenue)
CCAVENUE_MERCHANT_ID=your_merchant_id
CCAVENUE_ACCESS_CODE=your_access_code
CCAVENUE_WORKING_KEY=your_working_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Fraud Detection
FRAUD_SCORE_LOW=30
FRAUD_SCORE_MEDIUM=60
FRAUD_SCORE_HIGH=90
MAX_DISTANCE_KM_PER_HOUR=1000
MAX_TAPS_PER_HOUR=10
MAX_TAPS_PER_DAY=50
`;
  writeFileSync(join(__dirname, 'backend', '.env.production'), backendEnvTemplate);
  console.log('   ✅ Created backend/.env.production template\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Production environment files created!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Next steps:');
  console.log('1. Review and update backend/.env.production with your credentials');
  console.log('2. Build frontend: npm run build');
  console.log('3. Build for cPanel: npm run build:cpanel\n');

  rl.close();
}

buildProductionEnv().catch(console.error);

