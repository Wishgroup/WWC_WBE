/**
 * Member dashboard API
 * GET /api/members/me, /api/members/redemptions, /api/members/event-checkins, /api/members/vendors
 */

import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('member'));

/**
 * GET /api/members/me
 * Dashboard profile: member + card (cards or nfc_cards) + referral_code + referred_count
 */
router.get('/me', async (req, res) => {
  try {
    const memberId = req.user.userId;
    const memberRes = await query(
      `SELECT id, email, full_name, membership_type, membership_status, payment_status,
        subscription_start_date, subscription_end_date, referral_code, referred_by, created_at
       FROM members WHERE id = ?`,
      [memberId]
    );
    const member = memberRes.rows[0];
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    let card = null;
    try {
      const cardRes = await query(
        `SELECT card_public_id, card_uid, tier, expires_at, status
         FROM cards WHERE member_id = ? AND status IN ('active','blocked','lost','stolen','damaged')
         ORDER BY created_at DESC LIMIT 1`,
        [memberId]
      );
      if (cardRes.rows.length > 0) {
        const c = cardRes.rows[0];
        card = {
          cardPublicId: c.card_public_id,
          cardUid: c.card_uid || null,
          tier: c.tier,
          expiresAt: c.expires_at,
          status: c.status || 'active',
        };
      }
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }
    if (!card) {
      const nfcRes = await query(
        `SELECT card_uid, expiry_date, card_status
         FROM nfc_cards WHERE member_id = ? AND card_status IN ('active','blocked','lost','stolen','damaged')
         ORDER BY issued_at DESC LIMIT 1`,
        [memberId]
      );
      if (nfcRes.rows.length > 0) {
        const c = nfcRes.rows[0];
        card = {
          cardPublicId: null,
          cardUid: c.card_uid,
          tier: member.membership_type || 'annual',
          expiresAt: c.expiry_date,
          status: (c.card_status || 'active').toLowerCase(),
        };
      }
    }

    const referredRes = await query(
      'SELECT COUNT(*) as cnt FROM members WHERE referred_by = ?',
      [memberId]
    );
    const referredCount = referredRes.rows[0]?.cnt ?? 0;

    res.json({
      success: true,
      profile: {
        id: member.id,
        email: member.email,
        fullName: member.full_name,
        membershipType: member.membership_type || 'annual',
        membershipStatus: member.membership_status || 'active',
        subscriptionStart: member.subscription_start_date,
        subscriptionEnd: member.subscription_end_date,
        referralCode: member.referral_code || `WWC${String(member.id).padStart(4, '0')}`,
        referredCount: Number(referredCount),
      },
      card: card || null,
    });
  } catch (err) {
    console.error('GET /api/members/me error:', err);
    res.status(500).json({ success: false, error: 'Failed to load profile' });
  }
});

/**
 * GET /api/members/redemptions
 * List redemptions for the member (vendor name, amount, discount, date)
 */
router.get('/redemptions', async (req, res) => {
  try {
    const memberId = req.user.userId;
    let rows = [];
    try {
      const redRes = await query(
        `SELECT r.id, r.final_amount, r.discount_applied, r.currency, r.created_at,
                v.vendor_name
         FROM redemptions r
         JOIN vendors v ON v.id = r.vendor_id
         WHERE r.member_id = ?
         ORDER BY r.created_at DESC
         LIMIT 100`,
        [memberId]
      );
      rows = redRes.rows;
    } catch (e) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        return res.json({ success: true, redemptions: [] });
      }
      throw e;
    }
    const redemptions = rows.map((r) => ({
      id: r.id,
      vendor: r.vendor_name,
      amount: Number(r.final_amount),
      discount: Number(r.discount_applied || 0),
      currency: r.currency || 'AED',
      date: r.created_at,
    }));
    res.json({ success: true, redemptions });
  } catch (err) {
    console.error('GET /api/members/redemptions error:', err);
    res.status(500).json({ success: false, error: 'Failed to load redemptions' });
  }
});

/**
 * GET /api/members/event-checkins
 * List event check-ins for the member (event name, date)
 */
router.get('/event-checkins', async (req, res) => {
  try {
    const memberId = req.user.userId;
    let rows = [];
    try {
      const checkRes = await query(
        `SELECT ec.id, ec.checked_in_at, e.name as event_name, e.event_code
         FROM event_checkins ec
         JOIN events e ON e.id = ec.event_id
         WHERE ec.member_id = ?
         ORDER BY ec.checked_in_at DESC
         LIMIT 100`,
        [memberId]
      );
      rows = checkRes.rows;
    } catch (e) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        return res.json({ success: true, eventCheckins: [] });
      }
      throw e;
    }
    const eventCheckins = rows.map((r) => ({
      id: r.id,
      event: r.event_name,
      eventCode: r.event_code,
      date: r.checked_in_at,
    }));
    res.json({ success: true, eventCheckins });
  } catch (err) {
    console.error('GET /api/members/event-checkins error:', err);
    res.status(500).json({ success: false, error: 'Failed to load event check-ins' });
  }
});

/**
 * GET /api/members/vendors
 * Public-style list of active vendors (business listing for member dashboard)
 */
router.get('/vendors', async (req, res) => {
  try {
    let rows = [];
    try {
      const vRes = await query(
        `SELECT id, vendor_name, vendor_code, country, city, category, currency, max_discount_percentage
         FROM vendors WHERE is_active = 1
         ORDER BY vendor_name ASC
         LIMIT 200`
      );
      rows = vRes.rows;
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        const vRes2 = await query(
          `SELECT id, vendor_name, vendor_code, country, city, category, currency
           FROM vendors WHERE is_active = 1 ORDER BY vendor_name ASC LIMIT 200`
        );
        rows = vRes2.rows.map((r) => ({ ...r, max_discount_percentage: null }));
      } else throw e;
    }
    const vendors = rows.map((v) => ({
      id: v.id,
      name: v.vendor_name,
      code: v.vendor_code,
      location: [v.city, v.country].filter(Boolean).join(', ') || null,
      category: v.category || null,
      currency: v.currency || 'AED',
      maxDiscount: v.max_discount_percentage != null ? Number(v.max_discount_percentage) : null,
    }));
    res.json({ success: true, vendors });
  } catch (err) {
    console.error('GET /api/members/vendors error:', err);
    res.status(500).json({ success: false, error: 'Failed to load vendors' });
  }
});

/**
 * GET /api/members/offers
 * Get active offers for the member based on their membership type
 */
router.get('/offers', async (req, res) => {
  try {
    const memberId = req.user.userId;
    const { membershipType } = req.query;
    
    // Get member's membership type if not provided
    let memberType = membershipType;
    if (!memberType) {
      const memberRes = await query(
        'SELECT membership_type FROM members WHERE id = ?',
        [memberId]
      );
      memberType = memberRes.rows[0]?.membership_type || 'annual';
    }

    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    let offers = [];
    try {
      const offersRes = await query(
        `SELECT id, offer_code, offer_type, discount_percentage, discount_amount,
                vendor_category, country_code, valid_from, valid_until,
                usage_limit, priority, conditions
         FROM offers
         WHERE is_active = true
         AND (membership_type IS NULL OR membership_type = ?)
         AND (valid_from IS NULL OR valid_from <= ?)
         AND (valid_until IS NULL OR valid_until >= ?)
         ORDER BY priority DESC, id DESC
         LIMIT 50`,
        [memberType, currentTime, currentTime]
      );
      offers = offersRes.rows || [];
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }

    const formattedOffers = offers.map((o) => ({
      id: o.id,
      code: o.offer_code,
      type: o.offer_type,
      discount: o.discount_percentage ? `${o.discount_percentage}%` : (o.discount_amount ? `${o.discount_amount} AED` : 'Special'),
      title: o.offer_code || `${o.offer_type} Offer`,
      description: `Valid for ${o.vendor_category || 'all vendors'}`,
      validUntil: o.valid_until ? new Date(o.valid_until).toISOString().split('T')[0] : null,
      category: o.vendor_category,
      country: o.country_code,
    }));

    res.json({ success: true, offers: formattedOffers });
  } catch (err) {
    console.error('GET /api/members/offers error:', err);
    res.status(500).json({ success: false, error: 'Failed to load offers' });
  }
});

/**
 * POST /api/members/card/report
 * Report card as lost, stolen, or damaged
 */
router.post('/card/report', async (req, res) => {
  try {
    const memberId = req.user.userId;
    const { cardUid, issueType } = req.body;

    if (!issueType || !['lost', 'stolen', 'damaged'].includes(issueType)) {
      return res.status(400).json({ success: false, error: 'Invalid issue type' });
    }

    // Update card status
    let updated = false;
    try {
      if (cardUid) {
        const cardRes = await query(
          `UPDATE nfc_cards SET card_status = ? WHERE member_id = ? AND card_uid = ?`,
          [issueType, memberId, cardUid]
        );
        updated = cardRes.affectedRows > 0;
      }
      
      if (!updated) {
        const cardRes2 = await query(
          `UPDATE cards SET status = ? WHERE member_id = ?`,
          [issueType, memberId]
        );
        updated = cardRes2.affectedRows > 0;
      }
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    res.json({ success: true, message: `Card reported as ${issueType}` });
  } catch (err) {
    console.error('POST /api/members/card/report error:', err);
    res.status(500).json({ success: false, error: 'Failed to report card' });
  }
});

/**
 * POST /api/members/card/block
 * Block member's card
 */
router.post('/card/block', async (req, res) => {
  try {
    const memberId = req.user.userId;
    const { cardUid } = req.body;

    // Update card status to blocked
    let updated = false;
    try {
      if (cardUid) {
        const cardRes = await query(
          `UPDATE nfc_cards SET card_status = 'blocked' WHERE member_id = ? AND card_uid = ?`,
          [memberId, cardUid]
        );
        updated = cardRes.affectedRows > 0;
      }
      
      if (!updated) {
        const cardRes2 = await query(
          `UPDATE cards SET status = 'blocked' WHERE member_id = ?`,
          [memberId]
        );
        updated = cardRes2.affectedRows > 0;
      }
    } catch (e) {
      if (e.code !== 'ER_NO_SUCH_TABLE') throw e;
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    res.json({ success: true, message: 'Card blocked successfully' });
  } catch (err) {
    console.error('POST /api/members/card/block error:', err);
    res.status(500).json({ success: false, error: 'Failed to block card' });
  }
});

export default router;
