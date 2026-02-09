/**
 * Minimal backend test: card credential signature verification.
 * Run: node --experimental-vm-modules node_modules/jest/bin/jest test/cardCredential.test.js (if Jest installed)
 * Or: node test/cardCredential.test.js (self-run)
 */

import { buildPayload, signPayload, verifySignature } from '../modules/cards/cardCredential.js';

const originalEnv = process.env.CARD_SIGNING_SECRET;

function run() {
  process.env.CARD_SIGNING_SECRET = 'test_secret_min_32_chars_for_hmac_sha256';
  let passed = 0;
  let failed = 0;

  try {
    const payload = buildPayload({
      memberPublicId: 'm1',
      cardPublicId: 'cabc123',
      tier: 'annual',
      expiresAt: new Date('2026-12-31'),
      keyVersion: 1,
    });
    if (!payload.member_public_id || !payload.card_public_id || !payload.nonce) {
      console.error('FAIL: buildPayload missing fields');
      failed++;
    } else {
      console.log('PASS: buildPayload');
      passed++;
    }

    const signature = signPayload(payload, 1);
    if (!signature || typeof signature !== 'string' || signature.length < 32) {
      console.error('FAIL: signPayload');
      failed++;
    } else {
      console.log('PASS: signPayload');
      passed++;
    }

    const ok = verifySignature(payload, signature, 1);
    if (!ok) {
      console.error('FAIL: verifySignature (valid)');
      failed++;
    } else {
      console.log('PASS: verifySignature (valid)');
      passed++;
    }

    const tampered = { ...payload, tier: 'lifetime' };
    const okTampered = verifySignature(tampered, signature, 1);
    if (okTampered) {
      console.error('FAIL: verifySignature (tampered should fail)');
      failed++;
    } else {
      console.log('PASS: verifySignature (tampered rejected)');
      passed++;
    }
  } finally {
    if (originalEnv !== undefined) process.env.CARD_SIGNING_SECRET = originalEnv;
    else delete process.env.CARD_SIGNING_SECRET;
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
