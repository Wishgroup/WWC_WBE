/**
 * NFC validation request schemas (Zod)
 */

import { z } from 'zod';

export const validateNfcTapSchema = z.object({
  cardUid: z.string().min(1, 'cardUid is required').max(100),
  posReaderId: z.string().min(1, 'posReaderId is required').max(100),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  transactionAmount: z.number().min(0).optional().nullable(),
});

/**
 * Validate request body and return { success, data, error }
 * @param {Object} body - req.body
 * @returns {{ success: true, data: Object } | { success: false, error: string, details?: Object }}
 */
export function validateNfcTapBody(body) {
  const result = validateNfcTapSchema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const first = result.error.errors[0];
  const message = first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed';
  return {
    success: false,
    error: message,
    details: result.error.flatten(),
  };
}
