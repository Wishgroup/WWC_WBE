/**
 * Synthetic / anonymized sample data generator for analytics (portfolio-safe).
 * NO real customer or member data. Outputs to analytics/output/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');

const VENDOR_IDS = [1, 2, 3, 4, 5];
const MEMBER_IDS = Array.from({ length: 50 }, (_, i) => i + 1);
const CARD_UIDS = MEMBER_IDS.map((id) => `CARD_${String(id).padStart(4, '0')}`);
const RESULTS = ['approved', 'rejected', 'restricted'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(d, n) {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function generateSyntheticScans(count = 500) {
  const start = new Date('2025-01-01');
  const scans = [];
  for (let i = 0; i < count; i++) {
    const dayOffset = randomInt(0, 90);
    const date = addDays(start, dayOffset);
    date.setHours(randomInt(8, 20), randomInt(0, 59));
    scans.push({
      id: i + 1,
      member_id: randomChoice(MEMBER_IDS),
      card_uid: randomChoice(CARD_UIDS),
      vendor_id: randomChoice(VENDOR_IDS),
      pos_reader_id: `POS_${randomChoice(VENDOR_IDS)}_${randomInt(1, 3)}`,
      tap_timestamp: date.toISOString(),
      validation_result: randomChoice(RESULTS),
      fraud_score: randomInt(0, 40),
      latency_ms: randomInt(20, 180),
    });
  }
  return scans.sort((a, b) => new Date(a.tap_timestamp) - new Date(b.tap_timestamp));
}

function generateSyntheticFraudEvents(count = 80) {
  const start = new Date('2025-01-01');
  const types = ['rapid_repeat', 'cross_vendor_burst', 'frequency_anomaly', 'geo_inconsistency'];
  const events = [];
  for (let i = 0; i < count; i++) {
    const dayOffset = randomInt(0, 90);
    const date = addDays(start, dayOffset);
    events.push({
      id: i + 1,
      member_id: randomChoice(MEMBER_IDS),
      card_uid: randomChoice(CARD_UIDS),
      vendor_id: randomChoice(VENDOR_IDS),
      event_type: randomChoice(types),
      severity: randomChoice(['low', 'medium', 'high']),
      fraud_score: randomInt(30, 95),
      created_at: date.toISOString(),
    });
  }
  return events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const scans = generateSyntheticScans(600);
const fraudEvents = generateSyntheticFraudEvents(100);

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'synthetic_scans.json'),
  JSON.stringify(scans, null, 2),
  'utf8'
);
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'synthetic_fraud_events.json'),
  JSON.stringify(fraudEvents, null, 2),
  'utf8'
);

console.log('Generated synthetic data (portfolio-safe):');
console.log('  - analytics/output/synthetic_scans.json:', scans.length, 'rows');
console.log('  - analytics/output/synthetic_fraud_events.json:', fraudEvents.length, 'rows');
