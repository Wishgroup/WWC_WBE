/**
 * Support Chat Routes
 * Live chat between members and admins
 */

import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { logAudit } from '../services/AuditService.js';

const router = express.Router();

/**
 * Generate unique ticket number
 */
function generateTicketNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

/**
 * POST /api/support/tickets
 * Create a new support ticket (Member only)
 */
router.post('/tickets', authenticateToken, async (req, res) => {
  try {
    const { subject, description } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only members can create tickets
    if (userRole !== 'member') {
      return res.status(403).json({ error: 'Only members can create support tickets' });
    }

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }

    const ticketNumber = generateTicketNumber();

    // Create ticket
    const result = await query(
      `INSERT INTO support_tickets (ticket_number, member_id, subject, description, status, priority)
       VALUES (?, ?, ?, ?, 'open', 'normal')`,
      [ticketNumber, userId, subject, description]
    );

    const ticketId = result.insertId;

    // Create initial message from member
    await query(
      `INSERT INTO support_messages (ticket_id, sender_id, sender_type, message)
       VALUES (?, ?, 'member', ?)`,
      [ticketId, userId, description]
    );

    // Log audit
    await logAudit({
      userType: 'member',
      action: 'create_support_ticket',
      resourceType: 'support_ticket',
      resourceId: ticketId,
      details: { ticket_number: ticketNumber, subject },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      ticket: {
        id: ticketId,
        ticket_number: ticketNumber,
        subject,
        status: 'open',
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

/**
 * GET /api/support/tickets
 * Get tickets for current user (Member) or all tickets (Admin)
 */
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let tickets;

    if (userRole === 'admin') {
      // Admin sees all tickets
      const result = await query(
        `SELECT 
          t.id,
          t.ticket_number,
          t.member_id,
          t.subject,
          t.description,
          t.status,
          t.priority,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          t.resolved_at,
          t.closed_at,
          m.email as member_email,
          m.full_name as member_name,
          a.full_name as assigned_admin_name,
          (SELECT COUNT(*) FROM support_messages WHERE ticket_id = t.id) as message_count,
          (SELECT COUNT(*) FROM support_messages WHERE ticket_id = t.id AND sender_type = 'member' AND is_read = false) as unread_member_messages
         FROM support_tickets t
         LEFT JOIN members m ON t.member_id = m.id
         LEFT JOIN admin_users a ON t.assigned_to = a.id
         ORDER BY t.created_at DESC`
      );
      tickets = result.rows || result;
    } else {
      // Member sees only their tickets
      const result = await query(
        `SELECT 
          t.id,
          t.ticket_number,
          t.subject,
          t.description,
          t.status,
          t.priority,
          t.created_at,
          t.updated_at,
          t.resolved_at,
          (SELECT COUNT(*) FROM support_messages WHERE ticket_id = t.id) as message_count,
          (SELECT COUNT(*) FROM support_messages WHERE ticket_id = t.id AND sender_type = 'admin' AND is_read = false) as unread_admin_messages
         FROM support_tickets t
         WHERE t.member_id = ?
         ORDER BY t.created_at DESC`,
        [userId]
      );
      tickets = result.rows || result;
    }

    res.json({
      success: true,
      tickets: tickets || [],
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * GET /api/support/tickets/:ticketId
 * Get a specific ticket with messages
 */
router.get('/tickets/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get ticket
    let ticketResult;
    if (userRole === 'admin') {
      ticketResult = await query(
        `SELECT 
          t.*,
          m.email as member_email,
          m.full_name as member_name,
          a.full_name as assigned_admin_name
         FROM support_tickets t
         LEFT JOIN members m ON t.member_id = m.id
         LEFT JOIN admin_users a ON t.assigned_to = a.id
         WHERE t.id = ?`,
        [ticketId]
      );
    } else {
      ticketResult = await query(
        `SELECT * FROM support_tickets WHERE id = ? AND member_id = ?`,
        [ticketId, userId]
      );
    }

    const tickets = ticketResult.rows || ticketResult;
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = tickets[0];

    // Get messages
    const messagesResult = await query(
      `SELECT 
        m.*,
        CASE 
          WHEN m.sender_type = 'member' THEN mem.full_name
          WHEN m.sender_type = 'admin' THEN adm.full_name
        END as sender_name
       FROM support_messages m
       LEFT JOIN members mem ON m.sender_type = 'member' AND m.sender_id = mem.id
       LEFT JOIN admin_users adm ON m.sender_type = 'admin' AND m.sender_id = adm.id
       WHERE m.ticket_id = ?
       ORDER BY m.created_at ASC`,
      [ticketId]
    );

    const messages = messagesResult.rows || messagesResult;

    // Mark messages as read if admin is viewing
    if (userRole === 'admin') {
      await query(
        `UPDATE support_messages 
         SET is_read = true, read_at = NOW() 
         WHERE ticket_id = ? AND sender_type = 'member' AND is_read = false`,
        [ticketId]
      );
    } else {
      // Mark admin messages as read if member is viewing
      await query(
        `UPDATE support_messages 
         SET is_read = true, read_at = NOW() 
         WHERE ticket_id = ? AND sender_type = 'admin' AND is_read = false`,
        [ticketId]
      );
    }

    res.json({
      success: true,
      ticket,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

/**
 * POST /api/support/tickets/:ticketId/messages
 * Send a message in a ticket
 */
router.post('/tickets/:ticketId/messages', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify ticket exists and user has access
    let ticketResult;
    if (userRole === 'admin') {
      ticketResult = await query(
        `SELECT * FROM support_tickets WHERE id = ?`,
        [ticketId]
      );
    } else {
      ticketResult = await query(
        `SELECT * FROM support_tickets WHERE id = ? AND member_id = ?`,
        [ticketId, userId]
      );
    }

    const tickets = ticketResult.rows || ticketResult;
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = tickets[0];

    // Don't allow messages on closed tickets
    if (ticket.status === 'closed') {
      return res.status(400).json({ error: 'Cannot send messages to closed tickets' });
    }

    // If admin is responding, assign ticket to them and update status
    if (userRole === 'admin') {
      if (ticket.status === 'open') {
        await query(
          `UPDATE support_tickets 
           SET status = 'in_progress', assigned_to = ?, updated_at = NOW()
           WHERE id = ?`,
          [userId, ticketId]
        );
      } else if (ticket.assigned_to !== userId) {
        await query(
          `UPDATE support_tickets 
           SET assigned_to = ?, updated_at = NOW()
           WHERE id = ?`,
          [userId, ticketId]
        );
      }
    }

    // Create message
    const result = await query(
      `INSERT INTO support_messages (ticket_id, sender_id, sender_type, message)
       VALUES (?, ?, ?, ?)`,
      [ticketId, userId, userRole, message.trim()]
    );

    // Update ticket updated_at
    await query(
      `UPDATE support_tickets SET updated_at = NOW() WHERE id = ?`,
      [ticketId]
    );

    // Log audit
    await logAudit({
      userType: userRole,
      action: 'send_support_message',
      resourceType: 'support_ticket',
      resourceId: ticketId,
      details: { ticket_number: ticket.ticket_number },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: {
        id: result.insertId,
        ticket_id: ticketId,
        sender_id: userId,
        sender_type: userRole,
        message: message.trim(),
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * PATCH /api/support/tickets/:ticketId/status
 * Update ticket status (Admin only)
 */
router.patch('/tickets/:ticketId/status', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update ticket status' });
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'not_resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get ticket
    const ticketResult = await query(
      `SELECT * FROM support_tickets WHERE id = ?`,
      [ticketId]
    );
    const tickets = ticketResult.rows || ticketResult;
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updateFields = ['status = ?', 'updated_at = NOW()'];
    const updateValues = [status];

    if (status === 'resolved' || status === 'closed') {
      updateFields.push('resolved_at = NOW()');
    }

    if (status === 'closed') {
      updateFields.push('closed_at = NOW()');
    }

    // Update ticket
    await query(
      `UPDATE support_tickets 
       SET ${updateFields.join(', ')}
       WHERE id = ?`,
      [...updateValues, ticketId]
    );

    // If notes provided, add as admin message
    if (notes && notes.trim().length > 0) {
      await query(
        `INSERT INTO support_messages (ticket_id, sender_id, sender_type, message)
         VALUES (?, ?, 'admin', ?)`,
        [ticketId, userId, notes.trim()]
      );
    }

    // Log audit
    await logAudit({
      userType: 'admin',
      action: 'update_support_ticket_status',
      resourceType: 'support_ticket',
      resourceId: ticketId,
      details: { status, ticket_number: tickets[0].ticket_number },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

/**
 * GET /api/support/stats
 * Get support statistics (Admin only)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view statistics' });
    }

    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
        SUM(CASE WHEN status = 'not_resolved' THEN 1 ELSE 0 END) as not_resolved_tickets
       FROM support_tickets`
    );

    const stats = statsResult.rows ? statsResult.rows[0] : statsResult[0];

    res.json({
      success: true,
      stats: {
        total_tickets: parseInt(stats.total_tickets) || 0,
        open_tickets: parseInt(stats.open_tickets) || 0,
        in_progress_tickets: parseInt(stats.in_progress_tickets) || 0,
        resolved_tickets: parseInt(stats.resolved_tickets) || 0,
        closed_tickets: parseInt(stats.closed_tickets) || 0,
        not_resolved_tickets: parseInt(stats.not_resolved_tickets) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching support stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;

