import { z } from 'zod'
import type { RecurringPattern, RecurringTypes } from '@server/database/types'
import { idSchema } from './shared'

export const recurringPatternSchema = z.object({
  dayOfMonth: z.array(z.number().int().gte(1).lte(31)),
  dayOfWeek: z.array(z.number().int().positive().gte(1).lte(7)),
  maxNumOfOccurrences: z.number().int(),
  monthOfYear: z.array(z.number().int().positive().gte(1).lte(12)),
  recurringTypeId: idSchema,
  separationCount: z.number().int().positive(),
  taskId: idSchema,
  weekOfMonth: z.array(z.number().int()),
})

export const recurringTypeSchema = z.object({
  id: idSchema,
  recurringType: z.string(),
})

export const recurringPatternKeysAll = Object.keys(
  recurringPatternSchema.shape
) as (keyof RecurringPattern)[]

export const recurringTypeKeysAll = Object.keys(
  recurringTypeSchema.shape
) as (keyof RecurringTypes)[]
