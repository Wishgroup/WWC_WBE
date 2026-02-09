/**
 * Cards module routes: prepare and confirm DESFire EV2 credential issuance.
 * Admin-only. UID is optional for audit only; identity is card_public_id.
 */

import express from 'express';
import { query } from '../../database/connection.js';
import { logAudit } from '../../services/AuditService.js';
import { buildPayload, signPayload } from './cardCredential.js';
import crypto from 'crypto';

const PAYMENT_SUCCESS = ['paid', 'completed', 'success'];

/**
 * POST /api/admin/cards/prepare
 * Input: { memberId }
 * Output: { issueSessionId, card_public_id, payload, signature, key_version, expires_at }
 * Checks: member must be active + paid.
 */
export async function cardsPrepare(req, res) {
  try {
    const memberId = Number(req.body.memberId);
    if (!memberId || Number.isNaN(memberId)) {
      return res.status(400).json({ success: false, error: 'memberId is required' });
    }

    const memberResult = await query(
      `SELECT id, email, full_name, membership_type, membership_status, payment_status, subscription_end_date
       FROM members WHERE id = ?`,
      [memberId]
    );
    if (memberResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    const member = memberResult.rows[0];
    const paid = PAYMENT_SUCCESS.includes((member.payment_status || '').toLowerCase());
    const active = (member.membership_status || '') === 'active';
    const notExpired = !member.subscription_end_date || new Date(member.subscription_end_date) > new Date();
    if (!active || !paid || !notExpired) {
      return res.status(400).json({
        success: false,
        error: 'Member must be active and paid to prepare a card',
      });
    }

    const keyVersion = Number(process.env.CARD_SIGNING_KEY_VERSION) || 1;
    const memberPublicId = `m${member.id}`;
    const cardPublicId = `c${crypto.randomBytes(12).toString('hex')}`;
    const expiresAt = member.subscription_end_date
      ? new Date(member.subscription_end_date)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const payload = buildPayload({
      memberPublicId,
      cardPublicId,
      tier: member.membership_type || 'annual',
      expiresAt,
      keyVersion,
    });
    const signature = signPayload(payload, keyVersion);
    const issueSessionId = crypto.randomBytes(16).toString('hex');

    await query(
      `INSERT INTO card_issue_sessions (member_id, issue_session_id, card_public_id, payload, signature, key_version, expires_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'prepared')`,
      [
        member.id,
        issueSessionId,
        cardPublicId,
        JSON.stringify(payload),
        signature,
        keyVersion,
        expiresAt,
      ]
    );

    await logAudit({
      userType: 'admin',
      userId: req.user?.userId ?? null,
      action: 'card_prepare',
      resourceType: 'card',
      resourceId: memberId,
      details: { issueSessionId, card_public_id: cardPublicId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      issueSessionId,
      card_public_id: cardPublicId,
      payload,
      signature,
      key_version: keyVersion,
      expires_at: payload.expires_at,
    });
  } catch (err) {
    console.error('Card prepare error:', err);
    res.status(500).json({ success: false, error: err.message || 'Prepare failed' });
  }
}

/**
 * POST /api/admin/cards/confirm
 * Input: { issueSessionId, card_public_id, card_uid? }
 * Action: store cards row, mark card active, audit log.
 */
export async function cardsConfirm(req, res) {
  try {
    const { issueSessionId, card_public_id: cardPublicId, card_uid: cardUid } = req.body;
    if (!issueSessionId || !cardPublicId) {
      return res.status(400).json({ success: false, error: 'issueSessionId and card_public_id are required' });
    }

    const sessionResult = await query(
      `SELECT id, member_id, card_public_id, key_version, expires_at, status FROM card_issue_sessions WHERE issue_session_id = ?`,
      [issueSessionId]
    );
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Issue session not found' });
    }
    const session = sessionResult.rows[0];
    if (session.status !== 'prepared') {
      return res.status(400).json({ success: false, error: 'Session already confirmed or expired' });
    }
    if (session.card_public_id !== cardPublicId) {
      return res.status(400).json({ success: false, error: 'card_public_id mismatch' });
    }
    if (new Date(session.expires_at) < new Date()) {
      await query(`UPDATE card_issue_sessions SET status = 'expired' WHERE issue_session_id = ?`, [issueSessionId]);
      return res.status(400).json({ success: false, error: 'Session expired' });
    }

    const memberResult = await query(
      `SELECT membership_type, subscription_end_date FROM members WHERE id = ?`,
      [session.member_id]
    );
    const tier = memberResult.rows[0]?.membership_type || 'annual';
    const expiresAt = memberResult.rows[0]?.subscription_end_date || null;

    await query(
      `INSERT INTO cards (member_id, card_public_id, card_uid, key_version, tier, expires_at, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [session.member_id, cardPublicId, cardUid || null, session.key_version, tier, expiresAt]
    );
    await query(
      `UPDATE card_issue_sessions SET status = 'confirmed' WHERE issue_session_id = ?`,
      [issueSessionId]
    );

    await logAudit({
      userType: 'admin',
      userId: req.user?.userId ?? null,
      action: 'card_confirm',
      resourceType: 'card',
      resourceId: session.member_id,
      details: { issueSessionId, card_public_id: cardPublicId, card_uid: cardUid || null },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Card issuance confirmed',
      card_public_id: cardPublicId,
    });
  } catch (err) {
    console.error('Card confirm error:', err);
    res.status(500).json({ success: false, error: err.message || 'Confirm failed' });
  }
}

const router = express.Router();
router.post('/prepare', cardsPrepare);
router.post('/confirm', cardsConfirm);
export default router;
