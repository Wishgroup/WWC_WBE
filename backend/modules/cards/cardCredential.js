/**
 * DESFire EV2 card credential: payload and HMAC-SHA256 signature.
 * Secrets from env: CARD_SIGNING_SECRET or CARD_SIGNING_SECRET_v{key_version}.
 * Risk: Low.
 */

import crypto from 'crypto';

const DEFAULT_KEY_VERSION = 1;

function getSigningSecret(keyVersion = DEFAULT_KEY_VERSION) {
  const v = Number(keyVersion) || DEFAULT_KEY_VERSION;
  const secret = process.env[`CARD_SIGNING_SECRET_v${v}`] || process.env.CARD_SIGNING_SECRET;
  if (!secret || typeof secret !== 'string') {
    throw new Error('CARD_SIGNING_SECRET not configured');
  }
  return secret;
}

/**
 * Build payload object: member_public_id, card_public_id, tier, expires_at, key_version, nonce.
 */
export function buildPayload({ memberPublicId, cardPublicId, tier, expiresAt, keyVersion = DEFAULT_KEY_VERSION }) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const expiresAtIso = typeof expiresAt === 'string' ? expiresAt : (expiresAt?.toISOString?.() || new Date().toISOString());
  return {
    member_public_id: memberPublicId,
    card_public_id: cardPublicId,
    tier: tier || 'annual',
    expires_at: expiresAtIso,
    key_version: Number(keyVersion) || DEFAULT_KEY_VERSION,
    nonce,
  };
}

/**
 * Sign payload: HMAC-SHA256(JSON.stringify(payload), secret).
 * Returns hex signature.
 */
export function signPayload(payload, keyVersion) {
  const secret = getSigningSecret(keyVersion);
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
}

/**
 * Verify signature.
 */
export function verifySignature(payload, signature, keyVersion) {
  const expected = signPayload(payload, keyVersion);
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
