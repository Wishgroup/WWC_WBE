/**
 * NFC Card Lifecycle Management Service
 * Handles card issuance, blocking, reissuance, and UID blacklisting
 */

import { query, transaction } from '../database/connection.js';
import crypto from 'crypto';
import { logAudit } from './AuditService.js';

class NFCCardService {
  constructor() {
    this.encryptionKey = process.env.NFC_ENCRYPTION_KEY || 'default_key_change_in_production_32bytes';
    this.tokenSecret = process.env.NFC_TOKEN_SECRET || 'default_token_secret';
  }

  /**
   * Issue new NFC card to member
   */
  async issueCard(memberId, cardUid, isPrimary = true) {
    try {
      // Encrypt token
      const encryptedToken = this.encryptToken(cardUid, memberId);

      // If this is primary, unset other primary cards
      if (isPrimary) {
        await query(
          `UPDATE nfc_cards SET is_primary = false WHERE member_id = $1`,
          [memberId]
        );
      }

      // Insert new card
      const result = await query(
        `INSERT INTO nfc_cards 
         (member_id, card_uid, encrypted_token, is_primary, card_status)
         VALUES ($1, $2, $3, $4, 'active')
         RETURNING *`,
        [memberId, cardUid, encryptedToken, isPrimary]
      );

      await logAudit({
        userType: 'system',
        action: 'card_issued',
        resourceType: 'nfc_card',
        resourceId: result.rows[0].id,
        details: { memberId, cardUid, isPrimary },
      });

      return result.rows[0];
    } catch (error) {
      console.error('Card issuance error:', error);
      throw error;
    }
  }

  /**
   * Block card
   */
  async blockCard(cardUid, reason = 'admin_block', adminUserId = null) {
    try {
      const result = await query(
        `UPDATE nfc_cards 
         SET card_status = 'blocked', 
             blocked_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE card_uid = $1
         RETURNING *`,
        [cardUid]
      );

      if (result.rows.length > 0) {
        await logAudit({
          userType: 'admin',
          userId: adminUserId,
          action: 'card_blocked',
          resourceType: 'nfc_card',
          resourceId: result.rows[0].id,
          details: { cardUid, reason },
        });
      }

      return result.rows[0];
    } catch (error) {
      console.error('Card blocking error:', error);
      throw error;
    }
  }

  /**
   * Report card as lost/stolen/damaged
   */
  async reportCard(cardUid, reportType, adminUserId = null) {
    // reportType: 'lost', 'stolen', 'damaged'
    try {
      const result = await query(
        `UPDATE nfc_cards 
         SET card_status = $1, 
             blocked_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE card_uid = $2
         RETURNING *`,
        [reportType, cardUid]
      );

      if (result.rows.length > 0) {
        await logAudit({
          userType: 'admin',
          userId: adminUserId,
          action: `card_${reportType}`,
          resourceType: 'nfc_card',
          resourceId: result.rows[0].id,
          details: { cardUid, reportType },
        });
      }

      return result.rows[0];
    } catch (error) {
      console.error('Card reporting error:', error);
      throw error;
    }
  }

  /**
   * Reissue card (new UID, blacklist old UID)
   */
  async reissueCard(oldCardUid, newCardUid, adminUserId = null) {
    try {
      return await transaction(async (client) => {
        // Get old card data
        const oldCard = await client.query(
          `SELECT * FROM nfc_cards WHERE card_uid = $1`,
          [oldCardUid]
        );

        if (oldCard.rows.length === 0) {
          throw new Error('Old card not found');
        }

        const oldCardData = oldCard.rows[0];
        const memberId = oldCardData.member_id;

        // Blacklist old UID
        await client.query(
          `UPDATE nfc_cards 
           SET card_status = 'blacklisted',
               updated_at = CURRENT_TIMESTAMP
           WHERE card_uid = $1`,
          [oldCardUid]
        );

        // Issue new card with old card's member_id
        const encryptedToken = this.encryptToken(newCardUid, memberId);
        const newCard = await client.query(
          `INSERT INTO nfc_cards 
           (member_id, card_uid, encrypted_token, is_primary, card_status, previous_uid)
           VALUES ($1, $2, $3, $4, 'active', $5)
           RETURNING *`,
          [
            memberId,
            newCardUid,
            encryptedToken,
            oldCardData.is_primary,
            oldCardUid,
          ]
        );

        await logAudit({
          userType: 'admin',
          userId: adminUserId,
          action: 'card_reissued',
          resourceType: 'nfc_card',
          resourceId: newCard.rows[0].id,
          details: {
            oldCardUid,
            newCardUid,
            memberId,
          },
        });

        return newCard.rows[0];
      });
    } catch (error) {
      console.error('Card reissuance error:', error);
      throw error;
    }
  }

  /**
   * Unblock card
   */
  async unblockCard(cardUid, adminUserId = null) {
    try {
      const result = await query(
        `UPDATE nfc_cards 
         SET card_status = 'active',
             blocked_at = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE card_uid = $1
         RETURNING *`,
        [cardUid]
      );

      if (result.rows.length > 0) {
        await logAudit({
          userType: 'admin',
          userId: adminUserId,
          action: 'card_unblocked',
          resourceType: 'nfc_card',
          resourceId: result.rows[0].id,
          details: { cardUid },
        });
      }

      return result.rows[0];
    } catch (error) {
      console.error('Card unblocking error:', error);
      throw error;
    }
  }

  /**
   * Get member's cards
   */
  async getMemberCards(memberId) {
    const result = await query(
      `SELECT * FROM nfc_cards WHERE member_id = $1 ORDER BY is_primary DESC, issued_at DESC`,
      [memberId]
    );

    return result.rows;
  }

  /**
   * Encrypt token for NFC card
   * Uses AES-256-CBC with proper IV
   */
  encryptToken(cardUid, memberId) {
    const data = `${cardUid}:${memberId}:${Date.now()}`;
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend IV to encrypted data
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt token (for verification)
   */
  decryptToken(encryptedToken) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      
      const parts = encryptedToken.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      return null;
    }
  }
}

export default new NFCCardService();

