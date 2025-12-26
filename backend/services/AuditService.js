/**
 * Audit Logging Service
 * Comprehensive audit trail for all system actions
 */

import { query } from '../database/connection.js';

/**
 * Log audit event
 */
export const logAudit = async (auditData) => {
  const {
    userType, // 'admin', 'system', 'api'
    userId,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress,
    userAgent,
  } = auditData;

  try {
    await query(
      `INSERT INTO audit_logs 
       (user_type, user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userType,
        userId || null,
        action,
        resourceType || null,
        resourceId || null,
        JSON.stringify(details || {}),
        ipAddress || null,
        userAgent || null,
      ]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - audit logging should never break the main flow
  }
};

/**
 * Create fraud event
 */
export const createFraudEvent = async (eventData) => {
  const {
    memberId,
    cardUid,
    vendorId,
    eventType,
    severity,
    fraudScore,
    description,
    metadata,
    actionTaken,
  } = eventData;

  try {
    const result = await query(
      `INSERT INTO fraud_events 
       (member_id, card_uid, vendor_id, event_type, severity, fraud_score, 
        description, metadata, action_taken)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        memberId,
        cardUid,
        vendorId,
        eventType,
        severity,
        fraudScore,
        description,
        JSON.stringify(metadata || {}),
        actionTaken,
      ]
    );

    // Also log to audit
    await logAudit({
      userType: 'system',
      action: 'fraud_event_created',
      resourceType: 'fraud_event',
      resourceId: result.rows[0].id,
      details: {
        memberId,
        cardUid,
        eventType,
        severity,
        fraudScore,
      },
    });

    return result.rows[0].id;
  } catch (error) {
    console.error('Fraud event creation error:', error);
    throw error;
  }
};

/**
 * Get audit logs with filters
 */
export const getAuditLogs = async (filters = {}) => {
  const {
    userType,
    action,
    resourceType,
    resourceId,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = filters;

  let queryText = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (userType) {
    queryText += ` AND user_type = $${paramIndex}`;
    params.push(userType);
    paramIndex++;
  }

  if (action) {
    queryText += ` AND action = $${paramIndex}`;
    params.push(action);
    paramIndex++;
  }

  if (resourceType) {
    queryText += ` AND resource_type = $${paramIndex}`;
    params.push(resourceType);
    paramIndex++;
  }

  if (resourceId) {
    queryText += ` AND resource_id = $${paramIndex}`;
    params.push(resourceId);
    paramIndex++;
  }

  if (startDate) {
    queryText += ` AND created_at >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    queryText += ` AND created_at <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await query(queryText, params);
  return result.rows;
};





