import { z } from 'zod'
import type { RecurringPattern, RecurringTypes } from '@server/database/types'
import { idSchema } from './shared'

export const recurringPatternSchema = z.object({
  dayOfMonth: z.array(z.number().int().gte(1).lte(31)).nullable(),
  dayOfWeek: z.array(z.number().int().positive().gte(1).lte(7)).nullable(),
  maxNumOfOccurrences: z.number().int().nullable(),
  monthOfYear: z.array(z.number().int().positive().gte(1).lte(12)).nullable(),
  recurringType: z.string(),
  separationCount: z.number().int().min(0),
  taskId: idSchema,
  weekOfMonth: z.array(z.number().int()).nullable(),
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
