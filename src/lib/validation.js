import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  date: z.string().datetime(),
  location: z.string().optional(),
});
