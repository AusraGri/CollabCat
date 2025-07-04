import { z } from 'zod'
import { type Insertable, type Selectable } from 'kysely'
import type { RecurringPattern } from '@server/database/types'
import { idSchema } from './shared'

export const recurringPatternSchema = z.object({
  dayOfMonth: z.array(z.number().int().gte(1).lte(31)).nullable(),
  dayOfWeek: z.array(z.number().int().min(0).gte(0).lte(7)).nullable(),
  maxNumOfOccurrences: z.number().int().nullable(),
  monthOfYear: z.array(z.number().int().positive().gte(1).lte(12)).nullable(),
  recurringType: z.string(),
  separationCount: z.number().int().min(0),
  taskId: idSchema,
  weekOfMonth: z.array(z.number().int()).nullable(),
})
export const recurringPatternSchemaInput = z.object({
  dayOfMonth: z.array(z.number().int().gte(1).lte(31)).nullable().optional(),
  dayOfWeek: z
    .array(z.number().int().min(0).gte(0).lte(7))
    .nullable()
    .optional(),
  maxNumOfOccurrences: z.number().int().nullable().optional(),
  monthOfYear: z
    .array(z.number().int().positive().gte(1).lte(12))
    .nullable()
    .optional(),
  recurringType: z.string().trim().toLowerCase(),
  separationCount: z.number().int().min(0),
  weekOfMonth: z.array(z.number().int()).nullable().optional(),
})

export const recurringTypeSchema = z.object({
  id: idSchema,
  recurringType: z.string(),
})

export const inputRecurrenceSchema = recurringPatternSchema.omit({
  taskId: true,
})

export const recurrencePattern = recurringPatternSchema.omit({
  taskId: true,
  monthOfYear: true,
  weekOfMonth: true,
  dayOfMonth: true,
  maxNumOfOccurrences: true,
})
export const recurringPatternKeysAll = Object.keys(
  recurringPatternSchema.shape
) as (keyof RecurringPattern)[]

export type RecurrenceInsertable = Insertable<RecurringPattern>

export type RecurrencePatternInsertable = z.infer<
  typeof recurringPatternSchemaInput
>

export type RecurrencePattern = Selectable<RecurringPattern>
