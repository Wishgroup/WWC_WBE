/**
 * Events Service
 * Handles event management and check-in logic
 */

import { query } from '../database/connection.js';
import { logAudit } from './AuditService.js';
import { enqueueNotification } from './NotificationService.js';
import NFCCardService from './NFCCardService.js';
import NFCValidationPipeline from './NFCValidationPipeline.js';

class EventsService {
  /**
   * Get all active events
   */
  async getActiveEvents() {
    try {
      const result = await query(
        `SELECT e.*, er.allowed_tiers, er.time_window_start, er.time_window_end,
                er.allow_multiple_entry, er.anti_passback_minutes
         FROM events e
         LEFT JOIN event_rules er ON e.id = er.event_id
         WHERE e.is_active = true
         ORDER BY e.start_time ASC`
      );

      return result.rows || [];
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  }

  /**
   * Get event by code
   */
  async getEventByCode(eventCode) {
    try {
      const result = await query(
        `SELECT e.*, er.allowed_tiers, er.time_window_start, er.time_window_end,
                er.allow_multiple_entry, er.anti_passback_minutes
         FROM events e
         LEFT JOIN event_rules er ON e.id = er.event_id
         WHERE e.event_code = ? AND e.is_active = true`,
        [eventCode]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  /**
   * Check-in member to event via card
   */
  async checkInMember({
    eventCode,
    cardUid,
    cardPublicId,
    payload,
    signature,
  }) {
    try {
      // Get event
      const event = await this.getEventByCode(eventCode);
      if (!event) {
        throw new Error('Event not found or inactive');
      }

      // Validate card (signature-based or UID-based)
      let memberId, cardData, tier;

      if (cardPublicId && payload && signature) {
        // New signature-based validation
        const validation = await NFCValidationPipeline.validateNFCTap({
          cardPublicId,
          payload,
          signature,
          vendorId: null, // Not needed for event check-in
          posReaderId: 'EVENT_CHECKIN',
        });

        if (!validation.approved) {
          throw new Error(`Card validation failed: ${validation.reason}`);
        }

        memberId = validation.memberId;
        tier = validation.membershipType;

        // Get card data
        cardData = await NFCCardService.getCardByPublicId(cardPublicId);
        if (cardData && cardData.payload) {
          const payloadObj = JSON.parse(cardData.payload);
          tier = payloadObj.tier || tier;
        }
      } else if (cardUid) {
        // Legacy UID-based validation
        const validation = await NFCValidationPipeline.validateNFCTap({
          cardUid,
          vendorId: null,
          posReaderId: 'EVENT_CHECKIN',
        });

        if (!validation.approved) {
          throw new Error(`Card validation failed: ${validation.reason}`);
        }

        memberId = validation.memberId;
        tier = validation.membershipType;
      } else {
        throw new Error('Card identifier required (cardUid or cardPublicId+payload+signature)');
      }

      // Check membership is active
      const memberResult = await query(
        `SELECT membership_status, payment_status, subscription_end_date, membership_type
         FROM members WHERE id = ?`,
        [memberId]
      );

      if (memberResult.rows.length === 0) {
        throw new Error('Member not found');
      }

      const member = memberResult.rows[0];
      if (member.membership_status !== 'active' || 
          (member.payment_status !== 'success' && member.payment_status !== 'paid')) {
        throw new Error('Membership is not active');
      }

      // Check tier eligibility
      if (event.allowed_tiers) {
        const allowedTiers = typeof event.allowed_tiers === 'string' 
          ? JSON.parse(event.allowed_tiers) 
          : event.allowed_tiers;
        
        if (Array.isArray(allowedTiers) && !allowedTiers.includes(tier)) {
          throw new Error(`Membership tier '${tier}' not eligible for this event`);
        }
      }

      // Check time window
      if (event.time_window_start && event.time_window_end) {
        const now = new Date();
        const startTime = new Date(`${now.toDateString()} ${event.time_window_start}`);
        const endTime = new Date(`${now.toDateString()} ${event.time_window_end}`);
        
        if (now < startTime || now > endTime) {
          throw new Error(`Check-in outside allowed time window (${event.time_window_start} - ${event.time_window_end})`);
        }
      }

      // Check anti-passback
      if (!event.allow_multiple_entry && event.anti_passback_minutes > 0) {
        const antiPassbackTime = new Date();
        antiPassbackTime.setMinutes(antiPassbackTime.getMinutes() - event.anti_passback_minutes);

        const existingCheckin = await query(
          `SELECT id FROM event_checkins 
           WHERE event_id = ? AND member_id = ? AND checkin_time >= ?`,
          [event.id, memberId, antiPassbackTime]
        );

        if (existingCheckin.rows.length > 0) {
          throw new Error(`Anti-passback: Already checked in within last ${event.anti_passback_minutes} minutes`);
        }
      }

      // Check capacity
      if (event.max_capacity) {
        const currentCheckins = await query(
          'SELECT COUNT(*) as count FROM event_checkins WHERE event_id = ?',
          [event.id]
        );
        const count = currentCheckins.rows[0]?.count || 0;
        if (count >= event.max_capacity) {
          throw new Error('Event is at full capacity');
        }
      }

      // Create check-in record
      const checkinResult = await query(
        `INSERT INTO event_checkins 
         (event_id, member_id, card_public_id, card_uid, tier, checkin_time)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          event.id,
          memberId,
          cardPublicId || null,
          cardUid || null,
          tier,
        ]
      );

      // Get member details for notification
      const memberDetails = await query(
        'SELECT email, full_name, mobile_number FROM members WHERE id = ?',
        [memberId]
      );
      const memberInfo = memberDetails.rows[0];

      // Enqueue notifications
      try {
        await enqueueNotification({
          channel: 'email',
          recipient: memberInfo.email,
          template: 'event_checkin',
          data: {
            member_name: memberInfo.full_name,
            event_name: event.event_name,
            event_location: event.location,
            checkin_time: new Date().toISOString(),
          },
        });

        if (memberInfo.mobile_number) {
          await enqueueNotification({
            channel: 'sms',
            recipient: memberInfo.mobile_number,
            template: 'event_checkin',
            data: {
              member_name: memberInfo.full_name,
              event_name: event.event_name,
            },
          });
        }
      } catch (notifError) {
        console.error('Error enqueueing notifications:', notifError);
        // Don't fail check-in if notification fails
      }

      // Log audit
      await logAudit({
        userType: 'system',
        action: 'event_checkin',
        resourceType: 'event_checkin',
        resourceId: checkinResult.rows.insertId,
        details: {
          event_id: event.id,
          event_code: event.event_code,
          member_id: memberId,
        },
      });

      return {
        success: true,
        checkin_id: checkinResult.rows.insertId,
        event_name: event.event_name,
        checkin_time: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Event check-in error:', error);
      throw error;
    }
  }

  /**
   * Get event check-in logs
   */
  async getEventCheckins(eventId, limit = 100, offset = 0) {
    try {
      const result = await query(
        `SELECT ec.*, m.email, m.full_name, e.event_name
         FROM event_checkins ec
         JOIN members m ON ec.member_id = m.id
         JOIN events e ON ec.event_id = e.id
         WHERE ec.event_id = ?
         ORDER BY ec.checkin_time DESC
         LIMIT ? OFFSET ?`,
        [eventId, limit, offset]
      );

      return result.rows || [];
    } catch (error) {
      console.error('Error getting event check-ins:', error);
      throw error;
    }
  }
}

export default new EventsService();






