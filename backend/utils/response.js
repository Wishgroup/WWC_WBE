/**
 * Consistent API response format
 * All endpoints should use these helpers for uniform JSON shape.
 */

/**
 * Success response
 * @param {import('express').Response} res
 * @param {*} data - payload (object or array)
 * @param {number} [status=200]
 */
export const success = (res, data, status = 200) => {
  const body = typeof data === 'object' && data !== null && !Array.isArray(data)
    ? { success: true, ...data }
    : { success: true, data };
  if (Array.isArray(data)) body.data = data;
  else if (typeof data === 'object' && data !== null && !body.data) {
    Object.assign(body, data);
    if (!('success' in data)) body.success = true;
  }
  res.status(status).json(body);
};

/**
 * Paginated list response
 * @param {import('express').Response} res
 * @param {Array} items
 * @param {Object} meta - { page, limit, total }
 */
export const paginated = (res, items, meta) => {
  res.status(200).json({
    success: true,
    data: items,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil((meta.total || 0) / (meta.limit || 1)) || 0,
    },
  });
};

/**
 * Error response (use after validation or business logic failure)
 * @param {import('express').Response} res
 * @param {string} message - user-facing message
 * @param {number} [status=400]
 * @param {string} [code] - optional error code
 */
export const error = (res, message, status = 400, code = null) => {
  const body = { success: false, error: message };
  if (code) body.code = code;
  res.status(status).json(body);
};

/**
 * Not found
 */
export const notFound = (res, message = 'Resource not found') => {
  res.status(404).json({ success: false, error: message });
};
