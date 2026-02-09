/**
 * Central error handler – consistent response format and logging
 */

import { logAudit } from '../services/AuditService.js';

/**
 * Standard error response shape
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} message
 * @param {string} [code]
 * @param {*} [details] - only in development
 */
export function sendError(res, status, message, code = null, details = null) {
  const body = { success: false, error: message };
  if (code) body.code = code;
  if (details && process.env.NODE_ENV !== 'production') body.details = details;
  res.status(status).json(body);
}

/**
 * Express error handling middleware (4-arg)
 * Use: app.use(errorHandler)
 */
export default function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || 'Internal server error';
  const code = err.code || null;

  if (status >= 500) {
    console.error('Unhandled error:', err);
    logAudit({
      userType: 'system',
      action: 'server_error',
      details: {
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    }).catch(() => {});
  }

  sendError(
    res,
    status,
    process.env.NODE_ENV === 'production' && status >= 500 ? 'An error occurred' : message,
    code,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}
