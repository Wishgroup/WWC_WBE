/**
 * CC Avenue Payment Gateway Service
 * Handles encryption, payment initiation, and response handling
 */

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// CC Avenue Configuration
const CCAVENUE_CONFIG = {
  merchantId: process.env.CCAVENUE_MERCHANT_ID || '',
  accessCode: process.env.CCAVENUE_ACCESS_CODE || '',
  workingKey: process.env.CCAVENUE_WORKING_KEY || '',
  // Use test URL for development, live URL for production
  paymentUrl: process.env.CCAVENUE_PAYMENT_URL || 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
  redirectUrl: process.env.CCAVENUE_REDIRECT_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/response`,
  cancelUrl: process.env.CCAVENUE_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join?canceled=true`,
};

/**
 * Encrypt data using CC Avenue's encryption algorithm
 * @param {string} plainText - Plain text to encrypt
 * @param {string} key - Working key
 * @returns {string} Encrypted string
 */
function encrypt(plainText, key) {
  const keyBytes = Buffer.from(key);
  const plainBytes = Buffer.from(plainText, 'utf8');
  
  // Pad the plain text to be a multiple of 8 bytes
  const padding = 8 - (plainBytes.length % 8);
  const paddedPlainText = Buffer.concat([
    plainBytes,
    Buffer.alloc(padding, padding)
  ]);
  
  // Use AES-128-CBC encryption
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-128-cbc', keyBytes.slice(0, 16), iv);
  
  let encrypted = cipher.update(paddedPlainText);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Prepend IV to encrypted data
  const encryptedWithIv = Buffer.concat([iv, encrypted]);
  
  // Return base64 encoded string
  return encryptedWithIv.toString('base64');
}

/**
 * Decrypt data using CC Avenue's decryption algorithm
 * @param {string} encryptedText - Encrypted text
 * @param {string} key - Working key
 * @returns {string} Decrypted string
 */
function decrypt(encryptedText, key) {
  try {
    const keyBytes = Buffer.from(key);
    const encryptedBytes = Buffer.from(encryptedText, 'base64');
    
    // Extract IV (first 16 bytes)
    const iv = encryptedBytes.slice(0, 16);
    const encrypted = encryptedBytes.slice(16);
    
    // Decrypt using AES-128-CBC
    const decipher = crypto.createDecipheriv('aes-128-cbc', keyBytes.slice(0, 16), iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // Remove padding
    const padding = decrypted[decrypted.length - 1];
    return decrypted.slice(0, decrypted.length - padding).toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt payment response');
  }
}

/**
 * Validate card details (basic validation)
 * @param {Object} cardDetails - Card details object
 * @returns {Object} Validation result
 */
export function validateCardDetails(cardDetails) {
  const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = cardDetails;
  
  const errors = [];
  
  // Validate card number (remove spaces and dashes)
  const cleanCardNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
  if (!/^\d{13,19}$/.test(cleanCardNumber)) {
    errors.push('Card number must be between 13 and 19 digits');
  }
  
  // Validate expiry
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (!expiryMonth || expiryMonth < 1 || expiryMonth > 12) {
    errors.push('Invalid expiry month');
  }
  
  if (!expiryYear || expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    errors.push('Card has expired');
  }
  
  // Validate CVV
  if (!/^\d{3,4}$/.test(cvv)) {
    errors.push('CVV must be 3 or 4 digits');
  }
  
  // Validate cardholder name
  if (!cardholderName || cardholderName.trim().length < 2) {
    errors.push('Cardholder name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create payment request for CC Avenue
 * Note: Card details will be collected by CC Avenue on their payment page
 * @param {Object} paymentData - Payment data
 * @returns {Object} Payment request with encrypted data
 */
export function createPaymentRequest(paymentData) {
  const {
    orderId,
    amount,
    currency = 'AED',
    billingName,
    billingEmail,
    billingTel,
    billingAddress,
    billingCity,
    billingState,
    billingZip,
    billingCountry = 'AE',
  } = paymentData;
  
  // Prepare payment parameters (without card details - CC Avenue will collect them)
  const paymentParams = {
    merchant_id: CCAVENUE_CONFIG.merchantId,
    order_id: orderId,
    amount: amount.toFixed(2),
    currency: currency,
    redirect_url: CCAVENUE_CONFIG.redirectUrl,
    cancel_url: CCAVENUE_CONFIG.cancelUrl,
    billing_name: billingName,
    billing_email: billingEmail,
    billing_tel: billingTel,
    billing_address: billingAddress,
    billing_city: billingCity,
    billing_state: billingState || '',
    billing_zip: billingZip || '',
    billing_country: billingCountry,
  };
  
  // Convert to query string
  const queryString = Object.entries(paymentParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  // Encrypt the data
  const encryptedData = encrypt(queryString, CCAVENUE_CONFIG.workingKey);
  
  return {
    success: true,
    paymentUrl: CCAVENUE_CONFIG.paymentUrl,
    encryptedData,
    merchantId: CCAVENUE_CONFIG.merchantId,
    accessCode: CCAVENUE_CONFIG.accessCode,
  };
}

/**
 * Verify payment response from CC Avenue
 * @param {string} encryptedResponse - Encrypted response from CC Avenue
 * @returns {Object} Decrypted payment response
 */
export function verifyPaymentResponse(encryptedResponse) {
  try {
    const decryptedData = decrypt(encryptedResponse, CCAVENUE_CONFIG.workingKey);
    
    // Parse the decrypted data (it's in query string format)
    const params = new URLSearchParams(decryptedData);
    const response = {};
    
    for (const [key, value] of params.entries()) {
      response[key] = value;
    }
    
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Payment response verification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get CC Avenue configuration (for frontend)
 * @returns {Object} Configuration (without sensitive keys)
 */
export function getConfig() {
  return {
    merchantId: CCAVENUE_CONFIG.merchantId,
    paymentUrl: CCAVENUE_CONFIG.paymentUrl,
    redirectUrl: CCAVENUE_CONFIG.redirectUrl,
    cancelUrl: CCAVENUE_CONFIG.cancelUrl,
  };
}

