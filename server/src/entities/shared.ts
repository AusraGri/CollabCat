import { z } from 'zod'

export const idSchema = z.number().int().positive()

export const dateSchema = z
  .string()
  .refine((dateStr) => !Number.isNaN(Date.parse(dateStr)), {
    message: 'Invalid date format',
  })
  .transform((dateStr) => new Date(dateStr))


export const deleteOutputSchema = z.object({
    success: z.boolean(),
    message: z.string()
  })