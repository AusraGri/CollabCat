import { z } from 'zod'
import { setDateToUTCmidnight } from '@server/controllers/utility/helpers'

export const idSchema = z.number().int().positive()

export const dateSchema = z
  .date()
  .transform((date) => setDateToUTCmidnight(date))

export const messageOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})
