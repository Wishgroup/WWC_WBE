/**
 * Admin API Routes
 * For admin dashboard and operations
 * NO UI CHANGES - backend only
 */

import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimiter.js';
import { query } from '../database/connection.js';
import NFCCardService from '../services/NFCCardService.js';
import CountryRuleEngine from '../services/CountryRuleEngine.js';
import OfferEngine from '../services/OfferEngine.js';
import { getAuditLogs } from '../services/AuditService.js';
import { logAudit } from '../services/AuditService.js';

const router = express.Router();

// All admin routes require authentication
router.use(authenticateAdmin);
router.use(adminLimiter);

/**
 * GET /api/admin/fraud/logs
 * Get fraud event logs
 */
router.get('/fraud/logs', async (req, res) => {
  try {
    const {
      memberId,
      cardUid,
      severity,
      resolved,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = req.query;

    let queryText = 'SELECT * FROM fraud_events WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (memberId) {
      queryText += ` AND member_id = $${paramIndex}`;
      params.push(memberId);
      paramIndex++;
    }

    if (cardUid) {
      queryText += ` AND card_uid = $${paramIndex}`;
      params.push(cardUid);
      paramIndex++;
    }

    if (severity) {
      queryText += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    if (resolved !== undefined) {
      queryText += ` AND resolved = $${paramIndex}`;
      params.push(resolved === 'true');
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Fraud logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/fraud/stats
 * Get fraud statistics
 */
router.get('/fraud/stats', async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE severity = 'high') as high_severity,
        COUNT(*) FILTER (WHERE severity = 'medium') as medium_severity,
        COUNT(*) FILTER (WHERE severity = 'low') as low_severity,
        COUNT(*) FILTER (WHERE resolved = false) as unresolved,
        AVG(fraud_score) as avg_fraud_score
      FROM fraud_events
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    res.json({
      success: true,
      data: stats.rows[0],
    });
  } catch (error) {
    console.error('Fraud stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/cards/blocked
 * Get all blocked cards
 */
router.get('/cards/blocked', async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, m.email, m.full_name, m.membership_type
      FROM nfc_cards c
      JOIN members m ON c.member_id = m.id
      WHERE c.card_status IN ('blocked', 'blacklisted', 'lost', 'stolen')
      ORDER BY c.blocked_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Blocked cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/cards/block
 * Block a card
 */
router.post('/cards/block', async (req, res) => {
  try {
    const { cardUid, reason } = req.body;

    if (!cardUid) {
      return res.status(400).json({ error: 'cardUid is required' });
    }

    const card = await NFCCardService.blockCard(cardUid, reason, req.user?.userId);

    res.json({
      success: true,
      message: 'Card blocked successfully',
      data: card,
    });
  } catch (error) {
    console.error('Block card error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/cards/unblock
 * Unblock a card
 */
router.post('/cards/unblock', async (req, res) => {
  try {
    const { cardUid } = req.body;

    if (!cardUid) {
      return res.status(400).json({ error: 'cardUid is required' });
    }

    const card = await NFCCardService.unblockCard(cardUid, req.user?.userId);

    res.json({
      success: true,
      message: 'Card unblocked successfully',
      data: card,
    });
  } catch (error) {
    console.error('Unblock card error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/cards/reissue
 * Reissue a card (blacklist old, issue new)
 */
router.post('/cards/reissue', async (req, res) => {
  try {
    const { oldCardUid, newCardUid } = req.body;

    if (!oldCardUid || !newCardUid) {
      return res.status(400).json({ error: 'oldCardUid and newCardUid are required' });
    }

    const card = await NFCCardService.reissueCard(oldCardUid, newCardUid, req.user?.userId);

    res.json({
      success: true,
      message: 'Card reissued successfully',
      data: card,
    });
  } catch (error) {
    console.error('Reissue card error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/cards/report
 * Report card as lost/stolen/damaged
 */
router.post('/cards/report', async (req, res) => {
  try {
    const { cardUid, reportType } = req.body;

    if (!cardUid || !reportType) {
      return res.status(400).json({ error: 'cardUid and reportType are required' });
    }

    if (!['lost', 'stolen', 'damaged'].includes(reportType)) {
      return res.status(400).json({ error: 'Invalid reportType' });
    }

    const card = await NFCCardService.reportCard(cardUid, reportType, req.user?.userId);

    res.json({
      success: true,
      message: `Card reported as ${reportType}`,
      data: card,
    });
  } catch (error) {
    console.error('Report card error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/vendors/analytics
 * Get vendor usage analytics
 */
router.get('/vendors/analytics', async (req, res) => {
  try {
    const { vendorId, startDate, endDate } = req.query;

    let queryText = `
      SELECT 
        v.id,
        v.vendor_name,
        v.country,
        v.city,
        COUNT(DISTINCT t.member_id) as unique_members,
        COUNT(t.id) as total_taps,
        COUNT(t.id) FILTER (WHERE t.validation_result = 'approved') as approved_taps,
        COUNT(t.id) FILTER (WHERE t.offer_applied IS NOT NULL) as offers_applied,
        AVG(t.fraud_score) as avg_fraud_score
      FROM vendors v
      LEFT JOIN nfc_tap_logs t ON v.id = t.vendor_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (vendorId) {
      queryText += ` AND v.id = $${paramIndex}`;
      params.push(vendorId);
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND t.tap_timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND t.tap_timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryText += ` GROUP BY v.id, v.vendor_name, v.country, v.city ORDER BY total_taps DESC`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Vendor analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/country-rules
 * Create or update country rules
 */
router.post('/country-rules', async (req, res) => {
  try {
    const rules = await CountryRuleEngine.upsertCountryRules(req.body);

    await logAudit({
      userType: 'admin',
      userId: req.user?.userId,
      action: 'country_rules_updated',
      resourceType: 'country_rules',
      resourceId: rules.id,
      details: req.body,
    });

    res.json({
      success: true,
      message: 'Country rules updated successfully',
      data: rules,
    });
  } catch (error) {
    console.error('Country rules error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/audit-logs
 * Get audit logs
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await getAuditLogs(req.query);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/fraud/resolve
 * Resolve a fraud event
 */
router.post('/fraud/resolve', async (req, res) => {
  try {
    const { fraudEventId, resolutionNotes } = req.body;

    if (!fraudEventId) {
      return res.status(400).json({ error: 'fraudEventId is required' });
    }

    await query(
      `UPDATE fraud_events 
       SET resolved = true, 
           resolved_at = CURRENT_TIMESTAMP,
           resolved_by = $1
       WHERE id = $2`,
      [req.user?.userId, fraudEventId]
    );

    await logAudit({
      userType: 'admin',
      userId: req.user?.userId,
      action: 'fraud_event_resolved',
      resourceType: 'fraud_event',
      resourceId: fraudEventId,
      details: { resolutionNotes },
    });

    res.json({
      success: true,
      message: 'Fraud event resolved',
    });
  } catch (error) {
    console.error('Resolve fraud error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;




