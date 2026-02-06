/**
 * Card Signing Service
 * Handles HMAC-SHA256 signing for DESFire EV2 card credentials
 */

import crypto from 'crypto';

class CardSigningService {
  constructor() {
    // Card signing secret - should be versioned for key rotation
    // Format: CARD_SIGNING_SECRET_v1, CARD_SIGNING_SECRET_v2, etc.
    this.secretVersion = process.env.CARD_SIGNING_SECRET_VERSION || '1';
    this.secret = process.env[`CARD_SIGNING_SECRET_v${this.secretVersion}`] || 
                  process.env.CARD_SIGNING_SECRET || 
                  'default_card_signing_secret_change_in_production_64chars_minimum';
    
    if (this.secret.length < 32) {
      console.warn('⚠️  Card signing secret is too short. Use at least 32 characters for security.');
    }
  }

  /**
   * Generate a unique card public ID
   */
  generateCardPublicId() {
    // Format: CARD_<timestamp>_<random>
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    return `CARD_${timestamp}_${random}`;
  }

  /**
   * Generate a unique member public ID
   */
  generateMemberPublicId() {
    // Format: MEM_<timestamp>_<random>
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    return `MEM_${timestamp}_${random}`;
  }

  /**
   * Generate a unique nonce
   */
  generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create card payload (JSON structure to store on card)
   * @param {Object} params - Payload parameters
   * @returns {Object} - Payload object
   */
  createPayload({
    memberPublicId,
    cardPublicId,
    tier,
    expiresAt,
    keyVersion = 1,
    nonce,
    issuedAt,
  }) {
    return {
      member_public_id: memberPublicId,
      card_public_id: cardPublicId,
      tier: tier,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      key_version: keyVersion,
      nonce: nonce,
      issued_at: issuedAt ? new Date(issuedAt).toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Sign payload using HMAC-SHA256
   * @param {Object} payload - Payload object
   * @param {number} keyVersion - Key version to use
   * @returns {string} - Base64-encoded signature
   */
  signPayload(payload, keyVersion = null) {
    const version = keyVersion || this.secretVersion;
    const secret = process.env[`CARD_SIGNING_SECRET_v${version}`] || this.secret;
    
    // Convert payload to JSON string (sorted keys for consistency)
    const payloadString = JSON.stringify(payload, Object.keys(payload).sort());
    
    // Create HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadString);
    const signature = hmac.digest('base64');
    
    return signature;
  }

  /**
   * Verify signature
   * @param {Object} payload - Payload object
   * @param {string} signature - Signature to verify
   * @param {number} keyVersion - Key version used for signing
   * @returns {boolean} - True if signature is valid
   */
  verifySignature(payload, signature, keyVersion = null) {
    try {
      const version = keyVersion || this.secretVersion;
      const secret = process.env[`CARD_SIGNING_SECRET_v${version}`] || this.secret;
      
      // Convert payload to JSON string (sorted keys for consistency)
      const payloadString = JSON.stringify(payload, Object.keys(payload).sort());
      
      // Create HMAC-SHA256 signature
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payloadString);
      const expectedSignature = hmac.digest('base64');
      
      // Constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Prepare card credential for issuance
   * @param {Object} params - Credential parameters
   * @returns {Object} - { payload, signature, card_public_id, key_version }
   */
  prepareCredential({
    memberPublicId,
    tier,
    expiresAt,
    keyVersion = 1,
  }) {
    const cardPublicId = this.generateCardPublicId();
    const nonce = this.generateNonce();
    const issuedAt = new Date();

    const payload = this.createPayload({
      memberPublicId,
      cardPublicId,
      tier,
      expiresAt,
      keyVersion,
      nonce,
      issuedAt,
    });

    const signature = this.signPayload(payload, keyVersion);

    return {
      card_public_id: cardPublicId,
      payload: payload,
      payload_json: JSON.stringify(payload),
      signature: signature,
      key_version: keyVersion,
      nonce: nonce,
      issued_at: issuedAt.toISOString(),
    };
  }
}

export default new CardSigningService();




