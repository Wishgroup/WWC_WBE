/**
 * NFC Card Lifecycle Management Service
 * Handles card issuance, blocking, reissuance, and UID blacklisting
 */

import { query, transaction } from '../database/connection.js';
import crypto from 'crypto';
import { logAudit } from './AuditService.js';
import CardSigningService from './CardSigningService.js';

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
          `UPDATE nfc_cards SET is_primary = false WHERE member_id = ?`,
          [memberId]
        );
      }

      // Insert new card
      const result = await query(
        `INSERT INTO nfc_cards 
         (member_id, card_uid, encrypted_token, is_primary, card_status)
         VALUES (?, ?, ?, ?, 'active')`,
        [memberId, cardUid, encryptedToken, isPrimary]
      );

      // Get the inserted card
      const cardResult = await query(
        `SELECT * FROM nfc_cards WHERE id = ?`,
        [result.rows.insertId]
      );

      await logAudit({
        userType: 'system',
        action: 'card_issued',
        resourceType: 'nfc_card',
        resourceId: result.rows.insertId,
        details: { memberId, cardUid, isPrimary },
      });

      return cardResult.rows[0];
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
      await query(
        `UPDATE nfc_cards 
         SET card_status = 'blocked', 
             blocked_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE card_uid = ?`,
        [cardUid]
      );

      // Get the updated card
      const cardResult = await query(
        `SELECT * FROM nfc_cards WHERE card_uid = ?`,
        [cardUid]
      );

      if (cardResult.rows.length > 0) {
        await logAudit({
          userType: 'admin',
          userId: adminUserId,
          action: 'card_blocked',
          resourceType: 'nfc_card',
          resourceId: cardResult.rows[0].id,
          details: { cardUid, reason },
        });
      }

      return cardResult.rows[0] || null;
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
      await query(
        `UPDATE nfc_cards 
         SET card_status = ?, 
             blocked_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE card_uid = ?`,
        [reportType, cardUid]
      );

      // Get the updated card
      const cardResult = await query(
        `SELECT * FROM nfc_cards WHERE card_uid = ?`,
        [cardUid]
      );

      if (cardResult.rows.length > 0) {
        await logAudit({
          userType: 'admin',
          userId: adminUserId,
          action: `card_${reportType}`,
          resourceType: 'nfc_card',
          resourceId: cardResult.rows[0].id,
          details: { cardUid, reportType },
        });
      }

      return cardResult.rows[0] || null;
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
      return await transaction(async (connection) => {
        // Get old card data
        const [oldCardRows] = await connection.execute(
          `SELECT * FROM nfc_cards WHERE card_uid = ?`,
          [oldCardUid]
        );

        if (oldCardRows.length === 0) {
          throw new Error('Old card not found');
        }

        const oldCardData = oldCardRows[0];
        const memberId = oldCardData.member_id;

        // Blacklist old UID
        await connection.execute(
          `UPDATE nfc_cards 
           SET card_status = 'blacklisted',
               updated_at = CURRENT_TIMESTAMP
           WHERE card_uid = ?`,
          [oldCardUid]
        );

        // Issue new card with old card's member_id
        const encryptedToken = this.encryptToken(newCardUid, memberId);
        const [insertResult] = await connection.execute(
          `INSERT INTO nfc_cards 
           (member_id, card_uid, encrypted_token, is_primary, card_status, previous_uid)
           VALUES (?, ?, ?, ?, 'active', ?)`,
          [
            memberId,
            newCardUid,
            encryptedToken,
            oldCardData.is_primary,
            oldCardUid,
          ]
        );

        // Get the new card
        const [newCardRows] = await connection.execute(
          `SELECT * FROM nfc_cards WHERE id = ?`,
          [insertResult.insertId]
        );

        await logAudit({
          userType: 'admin',
          userId: adminUserId,
          action: 'card_reissued',
          resourceType: 'nfc_card',
          resourceId: insertResult.insertId,
          details: {
            oldCardUid,
            newCardUid,
            memberId,
          },
        });

        return newCardRows[0];
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
      await query(
        `UPDATE nfc_cards 
         SET card_status = 'active',
             blocked_at = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE card_uid = ?`,
        [cardUid]
      );

      // Get the updated card
      const cardResult = await query(
        `SELECT * FROM nfc_cards WHERE card_uid = ?`,
        [cardUid]
      );

      if (cardResult.rows.length > 0) {
        await logAudit({
          userType: 'admin',
          userId: adminUserId,
          action: 'card_unblocked',
          resourceType: 'nfc_card',
          resourceId: cardResult.rows[0].id,
          details: { cardUid },
        });
      }

      return cardResult.rows[0] || null;
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
      `SELECT * FROM nfc_cards WHERE member_id = ? ORDER BY is_primary DESC, issued_at DESC`,
      [memberId]
    );

    return result.rows;
  }

  /**
   * Prepare card credential for issuance (Phase 3)
   * Creates issue session and generates payload + signature
   */
  async prepareCardIssuance(memberId, adminUserId) {
    try {
      // Get member details
      const memberResult = await query(
        `SELECT id, email, full_name, membership_type, subscription_end_date, public_id
         FROM members WHERE id = ?`,
        [memberId]
      );

      if (memberResult.rows.length === 0) {
        throw new Error('Member not found');
      }

      const member = memberResult.rows[0];

      // Generate or get member public_id
      let memberPublicId = member.public_id;
      if (!memberPublicId) {
        memberPublicId = CardSigningService.generateMemberPublicId();
        await query(
          'UPDATE members SET public_id = ? WHERE id = ?',
          [memberPublicId, memberId]
        );
      }

      // Calculate expiration date
      let expiresAt = null;
      if (member.membership_type === 'annual' && member.subscription_end_date) {
        expiresAt = new Date(member.subscription_end_date);
      } else if (member.membership_type === 'lifetime') {
        // Lifetime memberships expire in 50 years
        expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 50);
      }

      // Prepare credential
      const credential = CardSigningService.prepareCredential({
        memberPublicId: memberPublicId,
        tier: member.membership_type || 'annual',
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        keyVersion: 1,
      });

      // Generate unique session ID
      const sessionId = `ISS_${Date.now()}_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

      // Create issue session
      await query(
        `INSERT INTO card_issue_sessions 
         (session_id, member_id, card_public_id, payload, signature, key_version, status, prepared_by)
         VALUES (?, ?, ?, ?, ?, ?, 'prepared', ?)`,
        [
          sessionId,
          memberId,
          credential.card_public_id,
          credential.payload_json,
          credential.signature,
          credential.key_version,
          adminUserId,
        ]
      );

      // Log audit
      await logAudit({
        userType: 'admin',
        userId: adminUserId,
        action: 'card_issuance_prepared',
        resourceType: 'card_issue_session',
        details: {
          sessionId,
          memberId,
          card_public_id: credential.card_public_id,
        },
      });

      return {
        sessionId,
        card_public_id: credential.card_public_id,
        payload: credential.payload,
        payload_json: credential.payload_json,
        signature: credential.signature,
        key_version: credential.key_version,
        member: {
          id: member.id,
          email: member.email,
          full_name: member.full_name,
          membership_type: member.membership_type,
        },
      };
    } catch (error) {
      console.error('Prepare card issuance error:', error);
      throw error;
    }
  }

  /**
   * Confirm card issuance (after physical write)
   * Updates card record with credential data
   */
  async confirmCardIssuance(sessionId, cardUid, adminUserId) {
    try {
      // Get issue session
      const sessionResult = await query(
        `SELECT * FROM card_issue_sessions WHERE session_id = ?`,
        [sessionId]
      );

      if (sessionResult.rows.length === 0) {
        throw new Error('Issue session not found');
      }

      const session = sessionResult.rows[0];

      if (session.status !== 'prepared') {
        throw new Error(`Session is not in 'prepared' status. Current status: ${session.status}`);
      }

      // Parse payload
      const payload = JSON.parse(session.payload);

      // Verify signature
      const isValid = CardSigningService.verifySignature(
        payload,
        session.signature,
        session.key_version
      );

      if (!isValid) {
        throw new Error('Invalid signature in issue session');
      }

      // Update or create card record
      const existingCard = await query(
        `SELECT id FROM nfc_cards WHERE card_public_id = ?`,
        [session.card_public_id]
      );

      if (existingCard.rows.length > 0) {
        // Update existing card
        await query(
          `UPDATE nfc_cards 
           SET card_uid = ?,
               payload = ?,
               signature = ?,
               key_version = ?,
               member_public_id = ?,
               tier = ?,
               expires_at = ?,
               nonce = ?,
               issued_at = ?,
               card_status = 'active',
               updated_at = NOW()
           WHERE card_public_id = ?`,
          [
            cardUid,
            session.payload,
            session.signature,
            session.key_version,
            payload.member_public_id,
            payload.tier,
            payload.expires_at ? new Date(payload.expires_at) : null,
            payload.nonce,
            payload.issued_at ? new Date(payload.issued_at) : new Date(),
            session.card_public_id,
          ]
        );
      } else {
        // Create new card record
        await query(
          `INSERT INTO nfc_cards 
           (member_id, card_uid, card_public_id, member_public_id, payload, signature, 
            key_version, tier, expires_at, nonce, issued_at, card_status, is_primary, encrypted_token)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', true, ?)`,
          [
            session.member_id,
            cardUid,
            session.card_public_id,
            payload.member_public_id,
            session.payload,
            session.signature,
            session.key_version,
            payload.tier,
            payload.expires_at ? new Date(payload.expires_at) : null,
            payload.nonce,
            payload.issued_at ? new Date(payload.issued_at) : new Date(),
            // Keep encrypted_token for backward compatibility (can be empty for new cards)
            '',
          ]
        );
      }

      // Update issue session status
      await query(
        `UPDATE card_issue_sessions 
         SET status = 'confirmed',
             confirmed_at = NOW(),
             card_uid = ?,
             updated_at = NOW()
         WHERE session_id = ?`,
        [cardUid, sessionId]
      );

      // Log audit
      await logAudit({
        userType: 'admin',
        userId: adminUserId,
        action: 'card_issuance_confirmed',
        resourceType: 'card_issue_session',
        details: {
          sessionId,
          card_public_id: session.card_public_id,
          card_uid: cardUid,
        },
      });

      return {
        success: true,
        card_public_id: session.card_public_id,
        card_uid: cardUid,
      };
    } catch (error) {
      console.error('Confirm card issuance error:', error);
      throw error;
    }
  }

  /**
   * Verify card signature (for validation)
   * @param {string} cardPublicId - Card public ID
   * @param {Object} payload - Payload from card
   * @param {string} signature - Signature from card
   * @returns {boolean} - True if signature is valid
   */
  async verifyCardSignature(cardPublicId, payload, signature) {
    try {
      // Get card from database to get key_version
      const cardResult = await query(
        `SELECT key_version, signature as stored_signature FROM nfc_cards WHERE card_public_id = ?`,
        [cardPublicId]
      );

      if (cardResult.rows.length === 0) {
        return false;
      }

      const card = cardResult.rows[0];
      const keyVersion = card.key_version || 1;

      // Verify signature
      return CardSigningService.verifySignature(payload, signature, keyVersion);
    } catch (error) {
      console.error('Card signature verification error:', error);
      return false;
    }
  }

  /**
   * Get card by public_id (for validation)
   */
  async getCardByPublicId(cardPublicId) {
    const result = await query(
      `SELECT * FROM nfc_cards WHERE card_public_id = ?`,
      [cardPublicId]
    );

    return result.rows[0] || null;
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

