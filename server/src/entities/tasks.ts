import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type { Tasks, CompletedTasks } from '@server/database/types'
import type { RecurrencePatternInsertable } from './recurrence'
import { idSchema, dateSchema } from './shared'
import {
  recurringPatternSchemaInput,
  recurringPatternSchema,
} from './recurrence'

export const taskSchema = z.object({
  id: idSchema,
  assignedUserId: idSchema.nullable(),
  categoryId: idSchema.nullable(),
  isCompleted: z.boolean(),
  completedAt: z.date().nullable(),
  createdByUserId: idSchema,
  description: z.string().trim().max(300).nullable(),
  groupId: idSchema.nullable(),
  points: z.number().min(0).nullable(),
  title: z.string().trim().min(3).max(100),
  startDate: dateSchema.nullable(),
  endDate: dateSchema.nullable(),
  startTime: z.string().nullable(),
  isRecurring: z.boolean().nullable(),
})
export const taskSchemaOutput = z.object({
  id: idSchema,
  assignedUserId: idSchema.nullable(),
  categoryId: idSchema.nullable(),
  isCompleted: z.boolean(),
  completedAt: z.date().nullable(),
  createdByUserId: idSchema,
  description: z.string().max(300).nullable(),
  groupId: idSchema.nullable(),
  points: z.number().positive().nullable(),
  title: z.string().min(3).max(100),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  isRecurring: z.boolean().nullable(),
  startTime: z.string().nullable(),
})
export const taskSchemaForDueTask = z.object({
  id: idSchema,
  assignedUserId: idSchema.nullable(),
  categoryId: idSchema.nullable(),
  isCompleted: z.boolean(),
  completedAt: z.date().nullable(),
  createdByUserId: idSchema,
  description: z.string().max(300).nullable(),
  groupId: idSchema.nullable(),
  points: z.number().positive().nullable(),
  title: z.string().min(3).max(100),
  startDate: z.date(),
  endDate: z.date().nullable(),
  isRecurring: z.boolean().nullable(),
  startTime: z.string().nullable(),
})

export const newTaskSchema = z.object({
  assignedUserId: idSchema.optional(),
  categoryId: idSchema.optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.date().optional(),
  createdByUserId: idSchema.optional(),
  description: z.string().trim().max(300).optional(),
  groupId: idSchema.optional(),
  points: z.number().positive().optional(),
  title: z.string().trim().min(3).max(100),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  startTime: z.string().nullable().optional(),
  isRecurring: z.boolean().nullable().optional(),
})

export const taskCompletedSchema = z.object({
  completedAt: z.preprocess(
    (val) => (typeof val === 'string' ? new Date(val) : val),
    z.date()
  ),
  completedBy: idSchema.nullable(),
  id: idSchema,
  instanceDate: z.preprocess(
    (val) => (typeof val === 'string' ? new Date(val) : val),
    z.date()
  ),
  taskId: idSchema,
})
export const taskCompletedOutputSchema = z.object({
  completedAt: z.string(),
  completedBy: idSchema.nullable(),
  id: idSchema,
  instanceDate: z.string(),
  taskId: idSchema,
})

const taskOptional = taskSchema
  .omit({
    title: true,
    id: true,
    createdByUserId: true,
    isCompleted: true,
    completedAt: true,
  })
  .partial()
export const inputTaskSchemaAlter = taskSchema.pick({
  title: true,
})
export const inputTaskSchema = inputTaskSchemaAlter.merge(taskOptional)

export const createTaskSchema = z.object({
  startDate: z.date().optional(),
  title: z.string().trim().min(3).max(100),
  assignedUserId: idSchema.optional(),
  categoryId: idSchema.optional(),
  description: z.string().trim().max(300).optional(),
  groupId: idSchema.nullable().optional(),
  points: z.number().positive().optional(),
  endDate: z.date().optional(),
  startTime: z.date().optional(),
})

export const taskUpdateOptional = taskSchema
  .omit({ id: true, createdByUserId: true })
  .partial()

export const taskUpdateSchema = z.object({
  id: idSchema.describe('Task id to update'),
  task: taskUpdateOptional.describe('Task updated data to save/change'),
  recurrence: recurringPatternSchemaInput
    .optional()
    .describe('if task is recurring, recurrence pattern is required'),
})

export const taskCompletionSchema = z.object({
  id: idSchema.describe('Task id'),
  instanceDate: dateSchema.describe(
    'Task instance date (when it is scheduled)'
  ),
  isCompleted: z
    .boolean()
    .describe(
      'If you want to mark task as completed - true, not completed - false'
    ),
})

export const getTasksSchema = z
  .object({
    title: z.string().trim().min(3).max(100),
    categoryId: idSchema,
    groupId: idSchema,
    assignedUserId: idSchema,
    createdByUserId: idSchema,
    id: idSchema,
  })
  .partial()

export const tasksDue = taskSchemaForDueTask.extend({
  completed: taskCompletedSchema.nullable(),
  recurrence: recurringPatternSchema.nullable(),
})

export const taskDataSchema = taskSchemaOutput.extend({
  completed: z.array(taskCompletedSchema.nullable()),
  recurrence: recurringPatternSchema.nullable(),
})

export const taskCompletionKeysAll = Object.keys(
  taskCompletedOutputSchema.shape
) as (keyof CompletedTasks)[]
export const tasksKeysAll = Object.keys(taskSchema.shape) as (keyof Tasks)[]

const excludedKeys = ['parentTaskId'] as const
export const tasksKeysPublic = tasksKeysAll.filter(
  (key) => !excludedKeys.includes(key as (typeof excludedKeys)[number])
) as (typeof tasksKeysAll)[number][]

export type TasksPublic = Pick<
  Selectable<Tasks>,
  (typeof tasksKeysPublic)[number]
>

// export type TaskUpdate = Omit<Updateable<Tasks>, 'createdByUserId' | 'id'>
export type TaskUpdateData = z.infer<typeof taskUpdateSchema>
export type InsertableTask = Insertable<Tasks>
export type NewTask = z.infer<typeof newTaskSchema>

export type TasksCompleted = z.infer<typeof taskCompletedSchema>

export type TasksDue = z.infer<typeof tasksDue>

export type TaskData = z.infer<typeof taskDataSchema>

export interface InsertTaskData {
  task: NewTask
  recurrence?: RecurrencePatternInsertable
}
