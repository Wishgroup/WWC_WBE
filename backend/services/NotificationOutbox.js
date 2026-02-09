/**
 * Notifications outbox: enqueue jobs; worker sends via email (existing SMTP) and SMS (placeholder).
 * Phase 6. Redeem and event check-in enqueue here; no inline send.
 */

import { query } from '../database/connection.js';
import { sendWelcomeEmail } from './EmailService.js';

export async function enqueueNotification({ channel, type, recipient, memberId, payload }) {
  const result = await query(
    `INSERT INTO notifications_outbox (channel, type, recipient, member_id, payload, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [channel, type, recipient || null, memberId || null, JSON.stringify(payload || {})]
  );
  const id = result.insertId ?? result.rows?.insertId;
  return { id, channel, type, status: 'pending' };
}

/**
 * SMS placeholder: sendSMS(to, message) -> { success, providerRef, error }.
 * No provider implementation; mock driver logs.
 */
export function sendSMS(to, message) {
  console.log('[SMS mock]', { to, messageLength: message?.length });
  return Promise.resolve({ success: true, providerRef: 'mock-' + Date.now(), error: null });
}

/**
 * Process pending outbox rows (run by worker/cron).
 * Email: use existing EmailService where applicable; else log.
 * SMS: use sendSMS placeholder.
 */
export async function processOutbox(limit = 50) {
  const result = await query(
    'SELECT id, channel, type, recipient, member_id, payload FROM notifications_outbox WHERE status = ? ORDER BY id LIMIT ?',
    ['pending', limit]
  );
  for (const row of result.rows) {
    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload || {};
    let success = false;
    let providerRef = null;
    let errorText = null;
    try {
      if (row.channel === 'email') {
        if (row.type === 'redeem_success' || row.type === 'event_checkin') {
          const member = await query('SELECT email FROM members WHERE id = ?', [row.member_id]);
          const email = member.rows[0]?.email || row.recipient;
          if (email) {
            try {
              const nodemailer = await import('nodemailer');
              const transporter = nodemailer.default.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_PORT === '465',
                auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
              });
              await transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@wishwavesclub.com',
                to: email,
                subject: `${row.type.replace('_', ' ')} – Wish Waves Club`,
                text: `Your ${row.type.replace('_', ' ')} was recorded.`,
              });
              success = true;
            } catch (e) {
              errorText = e.message;
            }
          }
        }
      } else if (row.channel === 'sms') {
        const member = await query('SELECT mobile_number FROM members WHERE id = ?', [row.member_id]);
        const to = member.rows[0]?.mobile_number || row.recipient || '';
        if (to) {
          const r = await sendSMS(to, payload.message || `${row.type} recorded.`);
          success = r.success;
          providerRef = r.providerRef;
          errorText = r.error || null;
        }
      }
    } catch (e) {
      errorText = e.message;
    }
    await query(
      'UPDATE notifications_outbox SET status = ?, provider_ref = ?, error_text = ?, sent_at = NOW() WHERE id = ?',
      [success ? 'sent' : 'failed', providerRef, errorText, row.id]
    );
  }
  return result.rows.length;
}
