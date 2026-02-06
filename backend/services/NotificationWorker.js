/**
 * Notification Worker
 * Processes notifications from outbox and sends them
 * Compatible with cPanel Passenger (can run as separate process or interval)
 */

import { getPendingNotifications, markNotificationSent, markNotificationFailed } from './NotificationService.js';
import { sendWelcomeEmail } from './EmailService.js';
import { sendSMS } from './SMSService.js';

/**
 * Process pending notifications
 * @param {number} batchSize - Number of notifications to process per run
 */
export async function processNotifications(batchSize = 50) {
  try {
    const pending = await getPendingNotifications(batchSize);

    if (pending.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const notification of pending) {
      try {
        const data = notification.data ? JSON.parse(notification.data) : {};

        if (notification.channel === 'email') {
          await sendEmailNotification(notification.template, notification.recipient, data);
        } else if (notification.channel === 'sms') {
          await sendSMSNotification(notification.template, notification.recipient, data);
        }

        await markNotificationSent(notification.id);
        sent++;
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        await markNotificationFailed(notification.id, error.message);
        failed++;
      }
    }

    return {
      processed: pending.length,
      sent,
      failed,
    };
  } catch (error) {
    console.error('Error processing notifications:', error);
    throw error;
  }
}

/**
 * Send email notification based on template
 */
async function sendEmailNotification(template, recipient, data) {
  switch (template) {
    case 'redeem_success':
      // Use existing email service or create new template
      // For now, we'll use a simple implementation
      const emailSubject = `Redemption Confirmation - Invoice ${data.invoice_id}`;
      const emailBody = `
        Dear ${data.member_name},
        
        Your redemption has been processed successfully.
        
        Invoice ID: ${data.invoice_id}
        Amount: $${data.amount} USD
        Discount: $${data.discount_amount || 0} USD
        Final Amount: $${data.final_amount} USD
        Vendor: ${data.vendor_name}
        
        Thank you for using Wish Waves Club!
      `;
      
      // Use existing email service (extend if needed)
      // For now, log it (will be implemented with proper email templates)
      console.log('📧 Email notification:', { recipient, subject: emailSubject });
      break;

    case 'event_checkin':
      const eventSubject = `Event Check-in Confirmation - ${data.event_name}`;
      const eventBody = `
        Dear ${data.member_name},
        
        You have successfully checked in to: ${data.event_name}
        Location: ${data.event_location}
        Time: ${new Date(data.checkin_time).toLocaleString()}
        
        We look forward to seeing you at the event!
      `;
      
      console.log('📧 Email notification:', { recipient, subject: eventSubject });
      break;

    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

/**
 * Send SMS notification based on template
 * Uses provider-agnostic SMS service
 */
async function sendSMSNotification(template, recipient, data) {
  const message = getSMSMessage(template, data);
  
  // Use SMS service (provider-agnostic)
  await sendSMS(recipient, message);
}

/**
 * Get SMS message text based on template
 */
function getSMSMessage(template, data) {
  switch (template) {
    case 'redeem_success':
      return `WWC: Redemption confirmed. Invoice ${data.invoice_id}, Amount: $${data.final_amount} USD. Thank you!`;
    
    case 'event_checkin':
      return `WWC: Check-in confirmed for ${data.event_name}. See you there!`;
    
    default:
      return `WWC: Notification - ${template}`;
  }
}

/**
 * Start worker (for separate process or cron)
 */
export async function startWorker(intervalMs = 60000) {
  console.log('🔄 Notification worker started (interval: ${intervalMs}ms)');

  // Process immediately
  await processNotifications();

  // Then process at interval
  setInterval(async () => {
    try {
      const result = await processNotifications();
      if (result.processed > 0) {
        console.log(`✅ Processed ${result.processed} notifications (${result.sent} sent, ${result.failed} failed)`);
      }
    } catch (error) {
      console.error('Worker error:', error);
    }
  }, intervalMs);
}

export default {
  processNotifications,
  startWorker,
};




