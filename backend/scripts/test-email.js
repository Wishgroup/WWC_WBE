/**
 * Email Configuration Test Script
 * Tests SMTP connection and email sending
 */

import dotenv from 'dotenv';
import { sendSubscriptionThankYou, sendLoginNotification, sendInquiryEmail } from '../services/EmailService.js';

dotenv.config();

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check environment variables
  console.log('1️⃣  Checking Environment Variables...');
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error(`   ❌ Missing: ${missing.join(', ')}`);
    console.error('   💡 Create backend/.env file with email configuration\n');
    process.exit(1);
  }
  
  console.log('   ✅ All email environment variables set');
  console.log(`   📧 SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`   🔌 SMTP Port: ${process.env.SMTP_PORT}`);
  console.log(`   👤 SMTP User: ${process.env.SMTP_USER}\n`);

  // Test 1: Subscription Thank You Email
  console.log('2️⃣  Testing Subscription Thank You Email...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const result = await sendSubscriptionThankYou(testEmail);
    console.log('   ✅ Subscription email sent successfully!');
    console.log(`   📬 Message ID: ${result.messageId}\n`);
  } catch (error) {
    console.error('   ❌ Failed to send subscription email');
    console.error(`   Error: ${error.message}\n`);
  }

  // Test 2: Login Notification Email
  console.log('3️⃣  Testing Login Notification Email...');
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const loginTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dubai',
      dateStyle: 'full',
      timeStyle: 'long',
    });
    const result = await sendLoginNotification(
      testEmail,
      'Test User',
      loginTime,
      '127.0.0.1'
    );
    console.log('   ✅ Login notification email sent successfully!');
    console.log(`   📬 Message ID: ${result.messageId}\n`);
  } catch (error) {
    console.error('   ❌ Failed to send login notification email');
    console.error(`   Error: ${error.message}\n`);
  }

  // Test 3: Inquiry Email
  console.log('4️⃣  Testing Inquiry Email...');
  try {
    const result = await sendInquiryEmail({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Inquiry',
      message: 'This is a test inquiry from the email test script.',
      phone: '+971501234567',
      inquiryType: 'general',
    });
    console.log('   ✅ Inquiry email sent successfully!');
    console.log(`   📬 Message ID: ${result.messageId}\n`);
  } catch (error) {
    console.error('   ❌ Failed to send inquiry email');
    console.error(`   Error: ${error.message}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Email test completed!');
  console.log('\n💡 Check the test email inbox to verify emails were received.');
  console.log('💡 To test with a specific email, set TEST_EMAIL environment variable:');
  console.log('   TEST_EMAIL=your@email.com node scripts/test-email.js\n');
}

// Run test
testEmail().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});


