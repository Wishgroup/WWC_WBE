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
import ApplicationsService from '../services/ApplicationsService.js';

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
 * POST /api/admin/cards/prepare
 * Prepare card credential for issuance (Phase 3)
 */
router.post('/cards/prepare', async (req, res) => {
  try {
    const { memberId } = req.body;
    const adminUserId = req.user?.userId || req.admin?.id;

    if (!memberId) {
      return res.status(400).json({ 
        success: false,
        error: 'memberId is required' 
      });
    }

    if (!adminUserId) {
      return res.status(401).json({ 
        success: false,
        error: 'Admin authentication required' 
      });
    }

    const result = await NFCCardService.prepareCardIssuance(memberId, adminUserId);

    res.json({
      success: true,
      message: 'Card credential prepared successfully',
      data: result,
    });
  } catch (error) {
    console.error('Prepare card error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

/**
 * POST /api/admin/cards/confirm
 * Confirm card issuance after physical write (Phase 3)
 */
router.post('/cards/confirm', async (req, res) => {
  try {
    const { sessionId, cardUid } = req.body;
    const adminUserId = req.user?.userId || req.admin?.id;

    if (!sessionId) {
      return res.status(400).json({ 
        success: false,
        error: 'sessionId is required' 
      });
    }

    if (!cardUid) {
      return res.status(400).json({ 
        success: false,
        error: 'cardUid is required' 
      });
    }

    if (!adminUserId) {
      return res.status(401).json({ 
        success: false,
        error: 'Admin authentication required' 
      });
    }

    const result = await NFCCardService.confirmCardIssuance(sessionId, cardUid, adminUserId);

    res.json({
      success: true,
      message: 'Card issuance confirmed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Confirm card error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
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
 * GET /api/admin/work-queue
 * Get work queue items (applications, card issuance, bank transfers)
 */
router.get('/work-queue', async (req, res) => {
  try {
    const workQueue = await ApplicationsService.getWorkQueue();

    res.json({
      success: true,
      data: workQueue,
    });
  } catch (error) {
    console.error('Work queue error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * POST /api/admin/applications/:id/approve
 * Approve a member or vendor application
 */
router.post('/applications/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationType = 'member' } = req.body; // 'member' or 'vendor'
    const adminUserId = req.user?.userId || req.admin?.id;

    if (!adminUserId) {
      return res.status(401).json({ 
        success: false,
        error: 'Admin authentication required' 
      });
    }

    let result;
    if (applicationType === 'vendor') {
      result = await ApplicationsService.approveVendorApplication(id, adminUserId);
    } else {
      result = await ApplicationsService.approveMemberApplication(id, adminUserId);
    }

    res.json({
      success: true,
      message: 'Application approved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

/**
 * POST /api/admin/applications/:id/reject
 * Reject a member or vendor application
 */
router.post('/applications/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationType = 'member', reason } = req.body; // 'member' or 'vendor'
    const adminUserId = req.user?.userId || req.admin?.id;

    if (!adminUserId) {
      return res.status(401).json({ 
        success: false,
        error: 'Admin authentication required' 
      });
    }

    let result;
    if (applicationType === 'vendor') {
      result = await ApplicationsService.rejectVendorApplication(id, adminUserId, reason);
    } else {
      result = await ApplicationsService.rejectMemberApplication(id, adminUserId, reason);
    }

    res.json({
      success: true,
      message: 'Application rejected',
      data: result,
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

/**
 * GET /api/admin/bank-transfers
 * Get bank transfer receipts with filtering
 */
router.get('/bank-transfers', async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    let query = `
      SELECT 
        btr.id,
        btr.order_id,
        btr.receipt_path,
        btr.receipt_filename,
        btr.receipt_original_name,
        btr.receipt_mime_type,
        btr.receipt_size,
        btr.status,
        btr.verified_by,
        btr.verified_at,
        btr.rejection_reason,
        btr.created_at,
        ps.amount,
        ps.membership_type,
        ps.form_data,
        ma.full_name as member_name,
        ma.email as member_email
      FROM bank_transfer_receipts btr
      LEFT JOIN payment_sessions ps ON btr.order_id = ps.order_id
      LEFT JOIN membership_applications ma ON btr.order_id = ma.order_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status !== 'all') {
      query += ' AND btr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY btr.created_at DESC';
    
    const result = await query(query, params);
    
    // MySQL returns result.rows or result directly depending on implementation
    const transfers = result.rows || result || [];
    
    res.json({
      success: true,
      transfers: transfers
    });
  } catch (error) {
    console.error('Get bank transfers error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch bank transfers'
    });
  }
});

/**
 * POST /api/admin/bank-transfers/:orderId/verify
 * Verify bank transfer and activate membership
 */
router.post('/bank-transfers/:orderId/verify', async (req, res) => {
  try {
    const { orderId } = req.params;
    const adminId = req.user?.id || req.user?.userId || null;
    
    // Get bank transfer receipt
    const receiptResult = await query(
      'SELECT * FROM bank_transfer_receipts WHERE order_id = ?',
      [orderId]
    );
    
    if (receiptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bank transfer receipt not found'
      });
    }
    
    const receipt = receiptResult.rows[0];
    
    if (receipt.status !== 'pending_verification') {
      return res.status(400).json({
        success: false,
        error: `Payment is already ${receipt.status}`
      });
    }
    
    // Update bank transfer receipt status
    await query(
      `UPDATE bank_transfer_receipts 
       SET status = 'verified', verified_by = ?, verified_at = NOW() 
       WHERE order_id = ?`,
      [adminId, orderId]
    );
    
    // Update payment session
    await query(
      `UPDATE payment_sessions 
       SET payment_status = 'verified' 
       WHERE order_id = ?`,
      [orderId]
    );
    
    // Update membership application
    await query(
      `UPDATE membership_applications 
       SET status = 'active', payment_status = 'paid' 
       WHERE order_id = ?`,
      [orderId]
    );
    
    // Get membership application details
    const appResult = await query(
      'SELECT * FROM membership_applications WHERE order_id = ?',
      [orderId]
    );
    
    if (appResult.rows.length > 0) {
      const application = appResult.rows[0];
      
      // Update or create member account
      const memberResult = await query(
        'SELECT id FROM members WHERE email = ?',
        [application.email]
      );
      
      if (memberResult.rows.length > 0) {
        // Update existing member
        await query(
          `UPDATE members 
           SET membership_status = 'active', 
               payment_status = 'paid',
               membership_type = ?,
               subscription_start_date = NOW(),
               subscription_end_date = CASE 
                 WHEN ? = 'annual' THEN DATE_ADD(NOW(), INTERVAL 1 YEAR)
                 ELSE NULL
               END,
               updated_at = NOW()
           WHERE email = ?`,
          [application.membership_type, application.membership_type, application.email]
        );
      } else {
        // Create new member (should already exist, but just in case)
        await query(
          `INSERT INTO members 
           (email, full_name, first_name, last_name, mobile_number, phone, address, country, 
            id_number, id_type, membership_type, membership_status, payment_status, role, 
            subscription_start_date, subscription_end_date, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'paid', 'member',
                   NOW(), 
                   CASE WHEN ? = 'annual' THEN DATE_ADD(NOW(), INTERVAL 1 YEAR) ELSE NULL END,
                   NOW(), NOW())`,
          [
            application.email,
            application.full_name,
            application.first_name,
            application.last_name,
            application.mobile_number,
            application.phone_number,
            application.address,
            application.country,
            application.id_number,
            application.id_type,
            application.membership_type,
            application.membership_type
          ]
        );
      }
      
      // Send welcome email
      try {
        const { sendWelcomeEmail } = await import('../services/EmailService.js');
        await sendWelcomeEmail(
          application.email,
          application.full_name,
          application.membership_type
        );
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the verification if email fails
      }
    }
    
    // Log audit
    await logAudit({
      userType: 'admin',
      action: 'bank_transfer_verified',
      resourceType: 'payment',
      resourceId: orderId,
      details: {
        orderId,
        verifiedBy: adminId,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      success: true,
      message: 'Bank transfer verified and membership activated successfully'
    });
  } catch (error) {
    console.error('Verify bank transfer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify bank transfer'
    });
  }
});

/**
 * POST /api/admin/bank-transfers/:orderId/reject
 * Reject bank transfer payment
 */
router.post('/bank-transfers/:orderId/reject', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id || req.user?.userId || null;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }
    
    // Get bank transfer receipt
    const receiptResult = await query(
      'SELECT * FROM bank_transfer_receipts WHERE order_id = ?',
      [orderId]
    );
    
    if (receiptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bank transfer receipt not found'
      });
    }
    
    const receipt = receiptResult.rows[0];
    
    if (receipt.status !== 'pending_verification') {
      return res.status(400).json({
        success: false,
        error: `Payment is already ${receipt.status}`
      });
    }
    
    // Update bank transfer receipt status
    await query(
      `UPDATE bank_transfer_receipts 
       SET status = 'rejected', verified_by = ?, verified_at = NOW(), rejection_reason = ? 
       WHERE order_id = ?`,
      [adminId, reason, orderId]
    );
    
    // Update payment session
    await query(
      `UPDATE payment_sessions 
       SET payment_status = 'rejected' 
       WHERE order_id = ?`,
      [orderId]
    );
    
    // Update membership application
    await query(
      `UPDATE membership_applications 
       SET status = 'rejected', payment_status = 'rejected' 
       WHERE order_id = ?`,
      [orderId]
    );
    
    // Log audit
    await logAudit({
      userType: 'admin',
      action: 'bank_transfer_rejected',
      resourceType: 'payment',
      resourceId: orderId,
      details: {
        orderId,
        rejectedBy: adminId,
        reason,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      success: true,
      message: 'Bank transfer rejected'
    });
  } catch (error) {
    console.error('Reject bank transfer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject bank transfer'
    });
  }
});

export default router;




