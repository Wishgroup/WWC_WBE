/**
 * Socket.IO Service
 * Handles real-time chat communication
 */

import jwt from 'jsonwebtoken';
import { query } from '../database/connection.js';
import { sendChatNotificationEmail } from './EmailService.js';

/**
 * Setup Socket.IO handlers
 */
export const setupSocketIO = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);

    // Join room for user's tickets
    socket.join(`user:${socket.userId}`);

    // If admin, join admin room
    if (socket.userRole === 'admin') {
      socket.join('admins');
    }

    // Join specific ticket room
    socket.on('join_ticket', async (ticketId) => {
      try {
        // Verify user has access to this ticket
        let ticketResult;
        if (socket.userRole === 'admin') {
          ticketResult = await query(
            'SELECT id FROM support_tickets WHERE id = ?',
            [ticketId]
          );
        } else {
          ticketResult = await query(
            'SELECT id FROM support_tickets WHERE id = ? AND member_id = ?',
            [ticketId, socket.userId]
          );
        }

        if (ticketResult.rows && ticketResult.rows.length > 0) {
          socket.join(`ticket:${ticketId}`);
          socket.emit('joined_ticket', { ticketId });
        } else {
          socket.emit('error', { message: 'Access denied to this ticket' });
        }
      } catch (error) {
        console.error('Error joining ticket:', error);
        socket.emit('error', { message: 'Failed to join ticket' });
      }
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { ticketId, message } = data;

        if (!ticketId || !message || message.trim().length === 0) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Verify ticket access
        let ticketResult;
        if (socket.userRole === 'admin') {
          ticketResult = await query(
            'SELECT * FROM support_tickets WHERE id = ?',
            [ticketId]
          );
        } else {
          ticketResult = await query(
            'SELECT * FROM support_tickets WHERE id = ? AND member_id = ?',
            [ticketId, socket.userId]
          );
        }

        const tickets = ticketResult.rows || ticketResult;
        if (!tickets || tickets.length === 0) {
          socket.emit('error', { message: 'Ticket not found' });
          return;
        }

        const ticket = tickets[0];

        if (ticket.status === 'closed') {
          socket.emit('error', { message: 'Cannot send messages to closed tickets' });
          return;
        }

        // Update ticket assignment if admin is responding
        if (socket.userRole === 'admin') {
          if (ticket.status === 'open') {
            await query(
              `UPDATE support_tickets 
               SET status = 'in_progress', assigned_to = ?, updated_at = NOW()
               WHERE id = ?`,
              [socket.userId, ticketId]
            );
          } else if (ticket.assigned_to !== socket.userId) {
            await query(
              `UPDATE support_tickets 
               SET assigned_to = ?, updated_at = NOW()
               WHERE id = ?`,
              [socket.userId, ticketId]
            );
          }
        }

        // Insert message into database
        const result = await query(
          `INSERT INTO support_messages (ticket_id, sender_id, sender_type, message)
           VALUES (?, ?, ?, ?)`,
          [ticketId, socket.userId, socket.userRole, message.trim()]
        );

        const messageId = result.insertId;

        // Update ticket updated_at
        await query(
          `UPDATE support_tickets SET updated_at = NOW() WHERE id = ?`,
          [ticketId]
        );

        // Get the inserted message
        const messageResult = await query(
          `SELECT m.*,
                  CASE 
                    WHEN m.sender_type = 'member' THEN mem.full_name
                    WHEN m.sender_type = 'admin' THEN adm.full_name
                  END as sender_name
           FROM support_messages m
           LEFT JOIN members mem ON m.sender_type = 'member' AND m.sender_id = mem.id
           LEFT JOIN admin_users adm ON m.sender_type = 'admin' AND m.sender_id = adm.id
           WHERE m.id = ?`,
          [messageId]
        );

        const newMessage = messageResult.rows[0];

        // Broadcast to all users in the ticket room
        io.to(`ticket:${ticketId}`).emit('new_message', {
          message: newMessage,
          ticketId,
        });

        // Send email notification
        try {
          if (socket.userRole === 'admin') {
            // Admin sent - notify member
            const memberRes = await query(
              'SELECT email, full_name FROM members WHERE id = ?',
              [ticket.member_id]
            );
            if (memberRes.rows && memberRes.rows.length > 0) {
              const member = memberRes.rows[0];
              await sendChatNotificationEmail(
                member.email,
                member.full_name || 'Member',
                ticket.ticket_number || `#${ticketId}`,
                ticket.subject || 'Support Ticket',
                message.trim(),
                'admin',
                false
              );
            }
          } else {
            // Member sent - notify assigned admin or all admins
            if (ticket.assigned_to) {
              const adminRes = await query(
                'SELECT email, full_name FROM admin_users WHERE id = ?',
                [ticket.assigned_to]
              );
              if (adminRes.rows && adminRes.rows.length > 0) {
                const admin = adminRes.rows[0];
                await sendChatNotificationEmail(
                  admin.email,
                  admin.full_name || 'Admin',
                  ticket.ticket_number || `#${ticketId}`,
                  ticket.subject || 'Support Ticket',
                  message.trim(),
                  'member',
                  true
                );
              }
            } else {
              // Notify all admins
              const adminsRes = await query(
                'SELECT email, full_name FROM admin_users WHERE is_active = true'
              );
              if (adminsRes.rows && adminsRes.rows.length > 0) {
                for (const admin of adminsRes.rows) {
                  await sendChatNotificationEmail(
                    admin.email,
                    admin.full_name || 'Admin',
                    ticket.ticket_number || `#${ticketId}`,
                    ticket.subject || 'Support Ticket',
                    message.trim(),
                    'member',
                    true
                  );
                }
              }
            }
          }
        } catch (emailError) {
          console.error('Failed to send chat notification email:', emailError);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { ticketId } = data;
      socket.to(`ticket:${ticketId}`).emit('user_typing', {
        userId: socket.userId,
        userRole: socket.userRole,
      });
    });

    socket.on('stop_typing', (data) => {
      const { ticketId } = data;
      socket.to(`ticket:${ticketId}`).emit('user_stopped_typing', {
        userId: socket.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });
};

