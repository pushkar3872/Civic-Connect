const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z
    .union([
      z.string().trim().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
      z.literal(''),
    ])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
});

const registerInternalSchema = registerSchema.extend({
  role: z.enum(['ADMIN', 'WORKER', 'CITIZEN']).optional(),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

module.exports = {
  registerSchema,
  registerInternalSchema,
  loginSchema,
};
