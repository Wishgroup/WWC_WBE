/**
 * Common validation schemas (Zod)
 */

import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
});

export const emailSchema = z.string().email('Invalid email').max(255);
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(128);

export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const first = result.error.errors[0];
  return {
    success: false,
    error: first ? `${first.path.join('.')}: ${first.message}` : 'Validation failed',
    details: result.error.flatten(),
  };
}
