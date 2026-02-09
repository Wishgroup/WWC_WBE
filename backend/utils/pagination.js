/**
 * Pagination helper for list endpoints
 * Default: page=1, limit=20, max limit=100
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse page and limit from query; return offset for SQL
 * @param {Object} query - req.query
 * @returns {{ page: number, limit: number, offset: number }}
 */
export const getPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * SQL LIMIT clause values
 * @param {Object} query - req.query
 * @returns {[number, number]} [limit, offset]
 */
export const getLimitOffset = (query = {}) => {
  const { limit, offset } = getPagination(query);
  return [limit, offset];
};
