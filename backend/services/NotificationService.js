/**
 * Notification Service
 * Handles enqueueing notifications to outbox
 * Worker process will send notifications asynchronously
 */

import { query } from '../database/connection.js';

/**
 * Enqueue notification to outbox
 * @param {Object} notification - Notification data
 * @param {string} notification.channel - 'email' or 'sms'
 * @param {string} notification.recipient - Email address or phone number
 * @param {string} notification.template - Template name (e.g., 'redeem_success', 'event_checkin')
 * @param {Object} notification.data - Template variables
 */
export async function enqueueNotification({ channel, recipient, template, data }) {
  try {
    if (!channel || !recipient || !template) {
      throw new Error('channel, recipient, and template are required');
    }

    // Insert into notifications_outbox
    const result = await query(
      `INSERT INTO notifications_outbox 
       (channel, recipient, template, data, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [
        channel,
        recipient,
        template,
        JSON.stringify(data || {}),
      ]
    );

    console.log(`✅ Notification enqueued: ${channel} to ${recipient} (template: ${template})`);

    return {
      success: true,
      notification_id: result.rows.insertId,
    };
  } catch (error) {
    console.error('Error enqueueing notification:', error);
    throw error;
  }
}

/**
 * Get pending notifications (for worker)
 */
export async function getPendingNotifications(limit = 50) {
  try {
    const result = await query(
      `SELECT * FROM notifications_outbox 
       WHERE status = 'pending'
       ORDER BY created_at ASC
       LIMIT ?`,
      [limit]
    );

    return result.rows || [];
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as sent
 */
export async function markNotificationSent(notificationId) {
  try {
    await query(
      `UPDATE notifications_outbox 
       SET status = 'sent',
           sent_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [notificationId]
    );
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    throw error;
  }
}

/**
 * Mark notification as failed
 */
export async function markNotificationFailed(notificationId, errorMessage) {
  try {
    await query(
      `UPDATE notifications_outbox 
       SET status = 'failed',
           error_message = ?,
           attempts = attempts + 1,
           last_attempt_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [errorMessage, notificationId]
    );
  } catch (error) {
    console.error('Error marking notification as failed:', error);
    throw error;
  }
}

export default {
  enqueueNotification,
  getPendingNotifications,
  markNotificationSent,
  markNotificationFailed,
};






