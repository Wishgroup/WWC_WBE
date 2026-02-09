/**
 * Events Routes
 * Handles event listing and check-in functionality
 */

import express from 'express';
import { query } from '../database/connection.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { logAudit } from '../services/AuditService.js';

const router = express.Router();

/**
 * GET /api/events
 * Get all active events
 */
router.get('/', apiLimiter, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    
    const events = await query(
      `SELECT 
        id,
        event_name as name,
        event_code as eventCode,
        description,
        start_time as startAt,
        end_time as endAt,
        location,
        max_capacity,
        is_active as isActive,
        created_at as createdAt
      FROM events
      WHERE is_active = true 
        AND end_time >= NOW()
      ORDER BY start_time ASC
      LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      events: events.rows || events || []
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

/**
 * POST /api/events/checkin
 * Check in to an event using NFC card
 */
router.post('/checkin', apiLimiter, async (req, res) => {
  try {
    const { eventId, payload, signature } = req.body;

    if (!eventId || !payload || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: eventId, payload, signature'
      });
    }

    // TODO: Implement full check-in logic with signature verification
    // For now, return a basic response
    
    await logAudit({
      userType: 'api',
      action: 'event_checkin',
      resourceType: 'event',
      details: { eventId, memberId: payload?.memberId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Check-in recorded',
      eventId,
      memberId: payload?.memberId
    });
  } catch (error) {
    console.error('Error processing check-in:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process check-in'
    });
  }
});

export default router;
