/**
 * Applications Service
 * Unified service for handling member and vendor applications
 */

import { query } from '../database/connection.js';
import { logAudit } from './AuditService.js';
import { sendWelcomeEmail } from './EmailService.js';

class ApplicationsService {
  /**
   * Get all pending applications (members and vendors)
   */
  async getPendingApplications() {
    try {
      // Get pending member applications
      const memberApps = await query(
        `SELECT 
          id,
          order_id,
          email,
          full_name as name,
          membership_type,
          amount,
          payment_status,
          status,
          created_at,
          'member' as application_type
        FROM membership_applications
        WHERE status IN ('pending', 'submitted')
        ORDER BY created_at DESC`
      );

      // Get pending vendor applications
      const vendorApps = await query(
        `SELECT 
          id,
          order_id,
          email,
          vendor_name as name,
          category as membership_type,
          payment_amount as amount,
          payment_status,
          status,
          created_at,
          'vendor' as application_type
        FROM vendor_applications
        WHERE status IN ('pending', 'submitted')
        ORDER BY created_at DESC`
      );

      return {
        members: memberApps.rows || [],
        vendors: vendorApps.rows || [],
        total: (memberApps.rows?.length || 0) + (vendorApps.rows?.length || 0),
      };
    } catch (error) {
      console.error('Error fetching pending applications:', error);
      throw error;
    }
  }

  /**
   * Get work queue items for admin dashboard
   */
  async getWorkQueue() {
    try {
      const pendingApps = await this.getPendingApplications();

      // Get pending card issuance (cards with status 'prepared' but not 'confirmed')
      // Note: card_issue_sessions table will be created in Phase 3
      let cardIssuance = { rows: [] };
      try {
        cardIssuance = await query(
          `SELECT 
            cis.id as session_id,
            cis.member_id,
            cis.card_public_id,
            cis.status,
            cis.created_at,
            m.email,
            m.full_name
          FROM card_issue_sessions cis
          JOIN members m ON cis.member_id = m.id
          WHERE cis.status = 'prepared'
          ORDER BY cis.created_at DESC`
        );
      } catch (error) {
        // Table doesn't exist yet (Phase 3) - return empty array
        if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
          console.log('card_issue_sessions table not found (Phase 3 feature)');
        } else {
          throw error;
        }
      }

      // Get bank transfer receipts pending approval
      const bankTransfers = await query(
        `SELECT 
          ps.id,
          ps.order_id,
          ps.email,
          ps.amount,
          ps.payment_status,
          ps.created_at,
          ps.form_data
        FROM payment_sessions ps
        WHERE ps.payment_method = 'bank_transfer'
          AND ps.payment_status = 'pending'
        ORDER BY ps.created_at DESC`
      );

      return {
        applications: {
          members: pendingApps.members,
          vendors: pendingApps.vendors,
          total: pendingApps.total,
        },
        cardIssuance: cardIssuance.rows || [],
        bankTransfers: bankTransfers.rows || [],
      };
    } catch (error) {
      console.error('Error fetching work queue:', error);
      throw error;
    }
  }

  /**
   * Approve member application
   */
  async approveMemberApplication(applicationId, adminUserId) {
    try {
      // Get application details
      const appResult = await query(
        'SELECT * FROM membership_applications WHERE id = ?',
        [applicationId]
      );

      if (appResult.rows.length === 0) {
        throw new Error('Application not found');
      }

      const application = appResult.rows[0];

      // Update application status
      await query(
        `UPDATE membership_applications 
         SET status = 'approved', 
             updated_at = NOW()
         WHERE id = ?`,
        [applicationId]
      );

      // Update member status to active
      await query(
        `UPDATE members 
         SET membership_status = 'active',
             payment_status = 'paid',
             updated_at = NOW()
         WHERE email = ?`,
        [application.email.toLowerCase()]
      );

      // Send acceptance email
      try {
        await sendWelcomeEmail(
          application.email,
          application.full_name,
          application.membership_type
        );
      } catch (emailError) {
        console.error('Error sending acceptance email:', emailError);
        // Don't fail the approval if email fails
      }

      // Log audit
      await logAudit({
        userType: 'admin',
        userId: adminUserId,
        action: 'member_application_approved',
        resourceType: 'membership_application',
        resourceId: applicationId,
        details: {
          email: application.email,
          membership_type: application.membership_type,
        },
      });

      return {
        success: true,
        application: {
          id: applicationId,
          status: 'approved',
        },
      };
    } catch (error) {
      console.error('Error approving member application:', error);
      throw error;
    }
  }

  /**
   * Approve vendor application
   */
  async approveVendorApplication(applicationId, adminUserId) {
    try {
      // Get application details
      const appResult = await query(
        'SELECT * FROM vendor_applications WHERE id = ?',
        [applicationId]
      );

      if (appResult.rows.length === 0) {
        throw new Error('Application not found');
      }

      const application = appResult.rows[0];

      // Update application status
      await query(
        `UPDATE vendor_applications 
         SET status = 'approved',
             approved_by = ?,
             approved_at = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [adminUserId, applicationId]
      );

      // Check if vendor already exists
      const existingVendor = await query(
        'SELECT id FROM vendors WHERE email = ? OR vendor_code = ?',
        [application.email.toLowerCase(), application.vendor_code]
      );

      if (existingVendor.rows.length > 0) {
        // Update existing vendor
        await query(
          `UPDATE vendors 
           SET vendor_status = 'active',
               payment_status = 'paid',
               updated_at = NOW()
           WHERE id = ?`,
          [existingVendor.rows[0].id]
        );
      } else {
        // Create new vendor
        await query(
          `INSERT INTO vendors (
            vendor_name, vendor_code, email, country, city, category, currency,
            vendor_status, payment_status, payment_amount, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            application.vendor_name,
            application.vendor_code,
            application.email.toLowerCase(),
            application.country,
            application.city,
            application.category,
            application.currency || 'AED',
            'active',
            'paid',
            application.payment_amount,
            true,
          ]
        );
      }

      // Send acceptance email (vendor version)
      try {
        // Use a vendor-specific email template if available
        await sendWelcomeEmail(
          application.email,
          application.vendor_name,
          'vendor'
        );
      } catch (emailError) {
        console.error('Error sending acceptance email:', emailError);
        // Don't fail the approval if email fails
      }

      // Log audit
      await logAudit({
        userType: 'admin',
        userId: adminUserId,
        action: 'vendor_application_approved',
        resourceType: 'vendor_application',
        resourceId: applicationId,
        details: {
          email: application.email,
          vendor_name: application.vendor_name,
        },
      });

      return {
        success: true,
        application: {
          id: applicationId,
          status: 'approved',
        },
      };
    } catch (error) {
      console.error('Error approving vendor application:', error);
      throw error;
    }
  }

  /**
   * Reject member application
   */
  async rejectMemberApplication(applicationId, adminUserId, reason = null) {
    try {
      // Get application details
      const appResult = await query(
        'SELECT * FROM membership_applications WHERE id = ?',
        [applicationId]
      );

      if (appResult.rows.length === 0) {
        throw new Error('Application not found');
      }

      const application = appResult.rows[0];

      // Update application status
      await query(
        `UPDATE membership_applications 
         SET status = 'rejected',
             updated_at = NOW()
         WHERE id = ?`,
        [applicationId]
      );

      // Update member status to rejected
      await query(
        `UPDATE members 
         SET membership_status = 'rejected',
             updated_at = NOW()
         WHERE email = ?`,
        [application.email.toLowerCase()]
      );

      // Log audit
      await logAudit({
        userType: 'admin',
        userId: adminUserId,
        action: 'member_application_rejected',
        resourceType: 'membership_application',
        resourceId: applicationId,
        details: {
          email: application.email,
          reason: reason,
        },
      });

      return {
        success: true,
        application: {
          id: applicationId,
          status: 'rejected',
        },
      };
    } catch (error) {
      console.error('Error rejecting member application:', error);
      throw error;
    }
  }

  /**
   * Reject vendor application
   */
  async rejectVendorApplication(applicationId, adminUserId, reason = null) {
    try {
      // Get application details
      const appResult = await query(
        'SELECT * FROM vendor_applications WHERE id = ?',
        [applicationId]
      );

      if (appResult.rows.length === 0) {
        throw new Error('Application not found');
      }

      const application = appResult.rows[0];

      // Update application status
      await query(
        `UPDATE vendor_applications 
         SET status = 'rejected',
             rejection_reason = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [reason, applicationId]
      );

      // Update vendor status if exists
      const existingVendor = await query(
        'SELECT id FROM vendors WHERE email = ?',
        [application.email.toLowerCase()]
      );

      if (existingVendor.rows.length > 0) {
        await query(
          `UPDATE vendors 
           SET vendor_status = 'rejected',
               updated_at = NOW()
           WHERE id = ?`,
          [existingVendor.rows[0].id]
        );
      }

      // Log audit
      await logAudit({
        userType: 'admin',
        userId: adminUserId,
        action: 'vendor_application_rejected',
        resourceType: 'vendor_application',
        resourceId: applicationId,
        details: {
          email: application.email,
          reason: reason,
        },
      });

      return {
        success: true,
        application: {
          id: applicationId,
          status: 'rejected',
        },
      };
    } catch (error) {
      console.error('Error rejecting vendor application:', error);
      throw error;
    }
  }
}

export default new ApplicationsService();

