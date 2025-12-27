/**
 * CC Avenue Payment Gateway Service
 * Handles encryption, payment initiation, and response handling
 */

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// CC Avenue Configuration
const CCAVENUE_CONFIG = {
  merchantId: (process.env.CCAVENUE_MERCHANT_ID || '').trim(),
  accessCode: (process.env.CCAVENUE_ACCESS_CODE || '').trim(),
  workingKey: (process.env.CCAVENUE_WORKING_KEY || '').trim(),
  // Use test URL for development, live URL for production
  paymentUrl: process.env.CCAVENUE_PAYMENT_URL || 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
  redirectUrl: process.env.CCAVENUE_REDIRECT_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/response`,
  cancelUrl: process.env.CCAVENUE_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join?canceled=true`,
};

// Validate configuration on module load
if (!CCAVENUE_CONFIG.merchantId || !CCAVENUE_CONFIG.accessCode || !CCAVENUE_CONFIG.workingKey) {
  console.warn('⚠️  CC Avenue credentials are not fully configured. Please check environment variables.');
}

/**
 * Encrypt data using CC Avenue's encryption algorithm
 * CC Avenue requires AES-128-CBC with PKCS7 padding
 * @param {string} plainText - Plain text to encrypt
 * @param {string} key - Working key (32 hex characters)
 * @returns {string} Encrypted string (base64)
 */
function encrypt(plainText, key) {
  try {
    if (!plainText || !key) {
      throw new Error('Plain text and key are required for encryption');
    }

    // Convert working key to buffer (CC Avenue working key is 32 hex characters)
    let keyBuffer;
    if (key.length === 32 && /^[0-9A-Fa-f]+$/.test(key)) {
      // Key is hex string, convert to buffer
      keyBuffer = Buffer.from(key, 'hex');
    } else {
      // Key is plain string, use as-is
      keyBuffer = Buffer.from(key, 'utf8');
    }

    // Use first 16 bytes for AES-128
    const encryptionKey = keyBuffer.slice(0, 16);
    
    // Convert plain text to buffer
    const plainBytes = Buffer.from(plainText, 'utf8');
    
    // Generate random IV (16 bytes for AES-128-CBC)
    const iv = crypto.randomBytes(16);
    
    // Create cipher with AES-128-CBC
    const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, iv);
    cipher.setAutoPadding(true); // Use PKCS7 padding automatically
    
    // Encrypt the data
    let encrypted = cipher.update(plainBytes, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Prepend IV to encrypted data (CC Avenue expects IV + encrypted data)
    const encryptedWithIv = Buffer.concat([iv, encrypted]);
    
    // Return base64 encoded string
    return encryptedWithIv.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt data using CC Avenue's decryption algorithm
 * @param {string} encryptedText - Encrypted text (base64)
 * @param {string} key - Working key (32 hex characters)
 * @returns {string} Decrypted string
 */
function decrypt(encryptedText, key) {
  try {
    if (!encryptedText || !key) {
      throw new Error('Encrypted text and key are required for decryption');
    }

    // Convert working key to buffer
    let keyBuffer;
    if (key.length === 32 && /^[0-9A-Fa-f]+$/.test(key)) {
      // Key is hex string, convert to buffer
      keyBuffer = Buffer.from(key, 'hex');
    } else {
      // Key is plain string, use as-is
      keyBuffer = Buffer.from(key, 'utf8');
    }

    // Use first 16 bytes for AES-128
    const decryptionKey = keyBuffer.slice(0, 16);
    
    // Decode base64 encrypted data
    const encryptedBytes = Buffer.from(encryptedText, 'base64');
    
    // Extract IV (first 16 bytes)
    const iv = encryptedBytes.slice(0, 16);
    const encrypted = encryptedBytes.slice(16);
    
    // Create decipher with AES-128-CBC
    const decipher = crypto.createDecipheriv('aes-128-cbc', decryptionKey, iv);
    decipher.setAutoPadding(true); // Use PKCS7 padding automatically
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // Return decrypted string
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Failed to decrypt payment response: ${error.message}`);
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
  try {
    // Validate configuration
    if (!CCAVENUE_CONFIG.merchantId || !CCAVENUE_CONFIG.accessCode || !CCAVENUE_CONFIG.workingKey) {
      return {
        success: false,
        error: 'CC Avenue credentials are not configured. Please check environment variables.',
        errors: {
          merchantId: !CCAVENUE_CONFIG.merchantId ? 'Missing' : 'OK',
          accessCode: !CCAVENUE_CONFIG.accessCode ? 'Missing' : 'OK',
          workingKey: !CCAVENUE_CONFIG.workingKey ? 'Missing' : 'OK',
        },
      };
    }

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

    // Validate required fields
    if (!orderId || !amount || !billingName || !billingEmail) {
      return {
        success: false,
        error: 'Missing required payment parameters',
      };
    }

    // Prepare payment parameters (CC Avenue required format)
    // Note: Parameter names must match CC Avenue's expected format exactly
    const paymentParams = {
      merchant_id: CCAVENUE_CONFIG.merchantId,
      order_id: orderId,
      amount: parseFloat(amount).toFixed(2), // Ensure 2 decimal places
      currency: currency.toUpperCase(), // Ensure uppercase
      redirect_url: CCAVENUE_CONFIG.redirectUrl,
      cancel_url: CCAVENUE_CONFIG.cancelUrl,
      billing_name: billingName.trim(),
      billing_email: billingEmail.trim().toLowerCase(),
      billing_tel: billingTel.trim(),
      billing_address: billingAddress.trim(),
      billing_city: billingCity.trim(),
      billing_state: (billingState || '').trim(),
      billing_zip: (billingZip || '').trim(),
      billing_country: billingCountry.toUpperCase(),
    };

    // Remove empty optional fields to avoid issues
    Object.keys(paymentParams).forEach(key => {
      if (paymentParams[key] === '' || paymentParams[key] === null || paymentParams[key] === undefined) {
        delete paymentParams[key];
      }
    });

    // Convert to query string (CC Avenue format)
    // Important: Parameters must be in specific order and properly encoded
    const queryString = Object.entries(paymentParams)
      .map(([key, value]) => {
        // CC Avenue expects URL encoding but some special characters need specific handling
        const encodedValue = encodeURIComponent(String(value));
        return `${key}=${encodedValue}`;
      })
      .join('&');

    // Encrypt the data using working key
    const encryptedData = encrypt(queryString, CCAVENUE_CONFIG.workingKey);

    if (!encryptedData) {
      return {
        success: false,
        error: 'Failed to encrypt payment data',
      };
    }

    return {
      success: true,
      paymentUrl: CCAVENUE_CONFIG.paymentUrl,
      encryptedData,
      merchantId: CCAVENUE_CONFIG.merchantId,
      accessCode: CCAVENUE_CONFIG.accessCode,
    };
  } catch (error) {
    console.error('Error creating payment request:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment request',
    };
  }
}

/**
 * Verify payment response from CC Avenue
 * @param {string} encryptedResponse - Encrypted response from CC Avenue
 * @returns {Object} Decrypted payment response
 */
export function verifyPaymentResponse(encryptedResponse) {
  try {
    if (!encryptedResponse) {
      return {
        success: false,
        error: 'Encrypted response is required',
      };
    }

    if (!CCAVENUE_CONFIG.workingKey) {
      return {
        success: false,
        error: 'Working key is not configured',
      };
    }

    // Decrypt the response
    const decryptedData = decrypt(encryptedResponse, CCAVENUE_CONFIG.workingKey);
    
    if (!decryptedData) {
      return {
        success: false,
        error: 'Failed to decrypt payment response',
      };
    }

    // Parse the decrypted data (it's in query string format)
    const params = new URLSearchParams(decryptedData);
    const response = {};
    
    for (const [key, value] of params.entries()) {
      response[key] = value;
    }

    // Validate required fields
    if (!response.order_id || !response.order_status) {
      return {
        success: false,
        error: 'Invalid payment response format',
      };
    }
    
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Payment response verification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify payment response',
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

