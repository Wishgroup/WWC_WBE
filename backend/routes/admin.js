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
import { sendWelcomeEmail, sendRejectionEmail } from '../services/EmailService.js';
import path from 'path';
import fs from 'fs';

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

/**
 * GET /api/admin/bank-transfers/pending
 * Get all pending bank transfer receipts
 */
router.get('/bank-transfers/pending', async (req, res) => {
  try {
    const { status = 'pending,under_review' } = req.query;
    const statuses = status.split(',');

    let queryText = `
      SELECT 
        btr.*,
        ps.email,
        ps.amount,
        ps.currency,
        ps.order_id,
        ps.created_at as payment_created_at,
        m.id as member_id,
        m.full_name as member_name,
        m.membership_type,
        au.full_name as reviewed_by_name
      FROM bank_transfer_receipts btr
      LEFT JOIN payment_sessions ps ON btr.payment_session_id = ps.id
      LEFT JOIN members m ON btr.member_id = m.id
      LEFT JOIN admin_users au ON btr.admin_reviewed_by = au.id
      WHERE btr.upload_status IN (${statuses.map(() => '?').join(',')})
      ORDER BY btr.created_at DESC
    `;

    const result = await query(queryText, statuses);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching pending receipts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/bank-transfers/:receiptId
 * Get receipt details including file download
 */
router.get('/bank-transfers/:receiptId', async (req, res) => {
  try {
    const { receiptId } = req.params;

    const result = await query(
      `SELECT 
        btr.*,
        ps.email,
        ps.amount,
        ps.currency,
        ps.order_id,
        ps.created_at as payment_created_at,
        m.id as member_id,
        m.full_name as member_name,
        m.membership_type,
        m.email as member_email,
        au.full_name as reviewed_by_name
      FROM bank_transfer_receipts btr
      LEFT JOIN payment_sessions ps ON btr.payment_session_id = ps.id
      LEFT JOIN members m ON btr.member_id = m.id
      LEFT JOIN admin_users au ON btr.admin_reviewed_by = au.id
      WHERE btr.id = ?`,
      [receiptId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const receipt = result.rows[0];

    // Generate file download URL
    const fileUrl = `/api/admin/bank-transfers/${receiptId}/download`;

    res.json({
      success: true,
      data: {
        ...receipt,
        fileUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching receipt details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/bank-transfers/:receiptId/download
 * Download receipt file
 */
router.get('/bank-transfers/:receiptId/download', async (req, res) => {
  try {
    const { receiptId } = req.params;

    const result = await query(
      'SELECT receipt_file_path, receipt_file_name, receipt_mime_type FROM bank_transfer_receipts WHERE id = ?',
      [receiptId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const receipt = result.rows[0];

    if (!fs.existsSync(receipt.receipt_file_path)) {
      return res.status(404).json({ error: 'Receipt file not found' });
    }

    res.setHeader('Content-Type', receipt.receipt_mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${receipt.receipt_file_name}"`);

    const fileStream = fs.createReadStream(receipt.receipt_file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading receipt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/bank-transfers/:receiptId/review
 * Review and approve/reject receipt
 */
router.post('/bank-transfers/:receiptId/review', async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { action, notes } = req.body;
    // Get admin ID from auth middleware - try req.admin first, then req.user
    let adminId = req.admin?.id;
    if (!adminId && req.user?.userId) {
      // Try to get admin from database using userId
      const adminResult = await query(
        'SELECT id FROM admin_users WHERE id = ? AND is_active = true',
        [parseInt(req.user.userId, 10)]
      );
      if (adminResult.rows.length > 0) {
        adminId = adminResult.rows[0].id;
      }
    }
    // If still no adminId, use a system/admin identifier (for API key auth)
    if (!adminId) {
      adminId = null; // Will be logged as system action
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
    }

    // Get receipt with related data
    const receiptResult = await query(
      `SELECT 
        btr.*,
        ps.id as payment_session_id,
        ps.member_id,
        ps.email,
        ps.amount,
        ps.currency,
        ps.order_id,
        m.full_name as member_name,
        m.membership_type,
        m.membership_status
      FROM bank_transfer_receipts btr
      LEFT JOIN payment_sessions ps ON btr.payment_session_id = ps.id
      LEFT JOIN members m ON btr.member_id = m.id
      WHERE btr.id = ?`,
      [receiptId]
    );

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const receipt = receiptResult.rows[0];

    if (action === 'approve') {
      // Update receipt status
      await query(
        `UPDATE bank_transfer_receipts SET
          upload_status = 'approved',
          admin_reviewed_by = ?,
          admin_reviewed_at = NOW(),
          admin_notes = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [adminId, notes || null, receiptId]
      );

      // Update payment session
      await query(
        `UPDATE payment_sessions SET
          payment_status = 'completed',
          updated_at = NOW()
        WHERE id = ?`,
        [receipt.payment_session_id]
      );

      // Update member status and payment info
      if (receipt.member_id) {
        await query(
          `UPDATE members SET
            membership_status = 'active',
            payment_status = 'paid',
            payment_amount = ?,
            subscription_start_date = NOW(),
            subscription_end_date = CASE 
              WHEN ? = 'lifetime' THEN NULL 
              ELSE DATE_ADD(NOW(), INTERVAL 1 YEAR)
            END,
            updated_at = NOW()
          WHERE id = ?`,
          [receipt.amount, receipt.membership_type, receipt.member_id]
        );

        // Send welcome email
        try {
          await sendWelcomeEmail(
            receipt.email,
            receipt.member_name || 'Member',
            receipt.membership_type || 'annual'
          );
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Continue even if email fails
        }
      }

      // Log audit
      await logAudit({
        userType: 'admin',
        userId: adminId,
        action: 'receipt_approved',
        resourceType: 'payment',
        resourceId: receipt.order_id,
        details: {
          receiptId,
          memberId: receipt.member_id,
          amount: receipt.amount,
          notes: notes || null,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        success: true,
        message: 'Receipt approved successfully. Member has been activated.',
        receiptId,
      });
    } else if (action === 'reject') {
      // Update receipt status
      await query(
        `UPDATE bank_transfer_receipts SET
          upload_status = 'rejected',
          admin_reviewed_by = ?,
          admin_reviewed_at = NOW(),
          admin_notes = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [adminId, notes || 'Receipt rejected', receiptId]
      );

      // Update payment session back to pending
      await query(
        `UPDATE payment_sessions SET
          payment_status = 'pending_bank_transfer',
          updated_at = NOW()
        WHERE id = ?`,
        [receipt.payment_session_id]
      );

      // Update member status
      if (receipt.member_id) {
        await query(
          `UPDATE members SET
            membership_status = 'pending',
            updated_at = NOW()
          WHERE id = ?`,
          [receipt.member_id]
        );
      }

      // Send rejection email
      try {
        await sendRejectionEmail(
          receipt.email,
          receipt.member_name || 'Member',
          receipt.order_id,
          notes || 'Receipt rejected. Please upload a new receipt.'
        );
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
        // Continue even if email fails
      }

      // Log audit
      await logAudit({
        userType: 'admin',
        userId: adminId,
        action: 'receipt_rejected',
        resourceType: 'payment',
        resourceId: receipt.order_id,
        details: {
          receiptId,
          memberId: receipt.member_id,
          notes: notes || null,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        success: true,
        message: 'Receipt rejected. Member has been notified.',
        receiptId,
      });
    }
  } catch (error) {
    console.error('Error reviewing receipt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;




