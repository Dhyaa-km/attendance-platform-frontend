import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Organizer email address is required')
    .email('Please enter a valid organizer email address (e.g. name@spaceapps-algiers.dz)'),
  password: z
    .string()
    .min(1, 'Organizer password is required')
    .min(12, 'Password must be at least 12 characters in length'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
