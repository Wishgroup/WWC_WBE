/**
 * Events API Routes
 * For event management and check-in
 */

import express from 'express';
import { apiLimiter } from '../middleware/rateLimiter.js';
import EventsService from '../services/EventsService.js';
import { authenticateToken, requireActiveMember } from '../middleware/auth.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { query } from '../database/connection.js';
import { logAudit } from '../services/AuditService.js';

const router = express.Router();

/**
 * GET /api/events
 * Get all active events (public)
 */
router.get('/', apiLimiter, async (req, res) => {
  try {
    const events = await EventsService.getActiveEvents();

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * POST /api/events/checkin
 * Check-in member to event via card
 */
router.post('/checkin', apiLimiter, async (req, res) => {
  try {
    const {
      eventCode,
      cardUid,
      cardPublicId,
      payload,
      signature,
    } = req.body;

    if (!eventCode) {
      return res.status(400).json({ 
        success: false,
        error: 'eventCode is required' 
      });
    }

    const result = await EventsService.checkInMember({
      eventCode,
      cardUid,
      cardPublicId,
      payload,
      signature,
    });

    res.json({
      success: true,
      message: 'Check-in successful',
      data: result,
    });
  } catch (error) {
    console.error('Event check-in error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Check-in failed' 
    });
  }
});

// Admin routes for event management
const adminRouter = express.Router();
adminRouter.use(authenticateAdmin);

/**
 * GET /api/admin/events
 * Get all events (admin)
 */
adminRouter.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT e.*, er.allowed_tiers, er.time_window_start, er.time_window_end,
              er.allow_multiple_entry, er.anti_passback_minutes
       FROM events e
       LEFT JOIN event_rules er ON e.id = er.event_id
       ORDER BY e.start_time DESC`
    );

    res.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * POST /api/admin/events
 * Create event
 */
adminRouter.post('/', async (req, res) => {
  try {
    const {
      event_name,
      event_code,
      description,
      start_time,
      end_time,
      location,
      max_capacity,
      allowed_tiers,
      time_window_start,
      time_window_end,
      allow_multiple_entry,
      anti_passback_minutes,
    } = req.body;

    if (!event_name || !event_code || !start_time || !end_time) {
      return res.status(400).json({ 
        success: false,
        error: 'event_name, event_code, start_time, and end_time are required' 
      });
    }

    // Create event
    const eventResult = await query(
      `INSERT INTO events 
       (event_name, event_code, description, start_time, end_time, location, max_capacity, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
      [
        event_name,
        event_code,
        description || null,
        start_time,
        end_time,
        location || null,
        max_capacity || null,
      ]
    );

    const eventId = eventResult.rows.insertId;

    // Create event rules if provided
    if (allowed_tiers || time_window_start || time_window_end || 
        allow_multiple_entry !== undefined || anti_passback_minutes !== undefined) {
      await query(
        `INSERT INTO event_rules 
         (event_id, allowed_tiers, time_window_start, time_window_end, 
          allow_multiple_entry, anti_passback_minutes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          eventId,
          allowed_tiers ? JSON.stringify(allowed_tiers) : null,
          time_window_start || null,
          time_window_end || null,
          allow_multiple_entry !== undefined ? allow_multiple_entry : false,
          anti_passback_minutes || 0,
        ]
      );
    }

    // Log audit
    await logAudit({
      userType: 'admin',
      userId: req.user?.userId || req.admin?.id,
      action: 'event_created',
      resourceType: 'event',
      resourceId: eventId,
      details: { event_code, event_name },
    });

    res.json({
      success: true,
      message: 'Event created successfully',
      data: { id: eventId, event_code },
    });
  } catch (error) {
    console.error('Create event error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        error: 'Event code already exists' 
      });
    }
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

/**
 * PUT /api/admin/events/:id
 * Update event
 */
adminRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      event_name,
      description,
      start_time,
      end_time,
      location,
      max_capacity,
      is_active,
      allowed_tiers,
      time_window_start,
      time_window_end,
      allow_multiple_entry,
      anti_passback_minutes,
    } = req.body;

    // Update event
    await query(
      `UPDATE events 
       SET event_name = COALESCE(?, event_name),
           description = COALESCE(?, description),
           start_time = COALESCE(?, start_time),
           end_time = COALESCE(?, end_time),
           location = COALESCE(?, location),
           max_capacity = COALESCE(?, max_capacity),
           is_active = COALESCE(?, is_active),
           updated_at = NOW()
       WHERE id = ?`,
      [
        event_name,
        description,
        start_time,
        end_time,
        location,
        max_capacity,
        is_active,
        id,
      ]
    );

    // Update or create event rules
    if (allowed_tiers !== undefined || time_window_start !== undefined || 
        time_window_end !== undefined || allow_multiple_entry !== undefined || 
        anti_passback_minutes !== undefined) {
      const existingRules = await query(
        'SELECT id FROM event_rules WHERE event_id = ?',
        [id]
      );

      if (existingRules.rows.length > 0) {
        await query(
          `UPDATE event_rules 
           SET allowed_tiers = COALESCE(?, allowed_tiers),
               time_window_start = COALESCE(?, time_window_start),
               time_window_end = COALESCE(?, time_window_end),
               allow_multiple_entry = COALESCE(?, allow_multiple_entry),
               anti_passback_minutes = COALESCE(?, anti_passback_minutes)
           WHERE event_id = ?`,
          [
            allowed_tiers ? JSON.stringify(allowed_tiers) : null,
            time_window_start,
            time_window_end,
            allow_multiple_entry,
            anti_passback_minutes,
            id,
          ]
        );
      } else {
        await query(
          `INSERT INTO event_rules 
           (event_id, allowed_tiers, time_window_start, time_window_end, 
            allow_multiple_entry, anti_passback_minutes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            allowed_tiers ? JSON.stringify(allowed_tiers) : null,
            time_window_start || null,
            time_window_end || null,
            allow_multiple_entry !== undefined ? allow_multiple_entry : false,
            anti_passback_minutes || 0,
          ]
        );
      }
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

/**
 * GET /api/admin/events/:id/checkins
 * Get event check-in logs
 */
adminRouter.get('/:id/checkins', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const checkins = await EventsService.getEventCheckins(
      id,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: checkins,
    });
  } catch (error) {
    console.error('Get event check-ins error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Mount admin routes
router.use('/admin', adminRouter);

export default router;





