import { z } from 'zod'
import type { Selectable, Insertable} from 'kysely'
import type { Tasks} from '@server/database/types'
import type { RecurrencePatternInsertable } from './recurrence'
import { idSchema, dateSchema } from './shared'
import { recurringPatternSchemaInput, recurringPatternSchema } from './recurrence';

export const taskSchema = z.object({
  id: idSchema,
  assignedUserId: idSchema,
  categoryId: idSchema,
  isCompleted: z.boolean(),
  completedAt: z.date(),
  createdByUserId: idSchema,
  description: z.string().trim().max(300),
  groupId: idSchema,
  importance: z.enum(['High', 'Medium', 'ASAP', 'On Fire!']),
  points: z.number().positive(),
  title: z.string().trim().min(3).max(100),
  startDate: dateSchema,
  endDate: dateSchema,
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
  importance: z.string().nullable(),
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
  importance: z.string().nullable(),
  points: z.number().positive().nullable(),
  title: z.string().min(3).max(100),
  startDate: z.date(),
  endDate: z.date().nullable(),
  isRecurring: z.boolean().nullable(),
  startTime: z.string().nullable(),
})

const newTaskSchema = z.object({
  assignedUserId: idSchema.optional(),
  categoryId: idSchema.optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.date().optional(),
  createdByUserId: idSchema.optional(),
  description: z.string().trim().max(300).optional(),
  groupId: idSchema.optional(),
  importance: z.enum(['High', 'Medium', 'ASAP', 'On Fire!']).optional(),
  points: z.number().positive().optional(),
  title: z.string().trim().min(3).max(100),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().nullable().optional(),
  isRecurring: z.boolean().nullable().optional(),
})

const taskCompletedSchema = z.object({
  completedAt: z.date(),
  id: idSchema,
  instanceDate: z.date(),
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
  groupId: idSchema.optional(),
  importance: z.string().optional(),
  points: z.number().positive().optional(),
  endDate: z.date().optional(),
  startTime: z.date().optional(),
})

export const taskUpdateOptional = taskSchemaOutput
  .omit({ id: true, createdByUserId: true })
  .partial()

export const taskUpdateSchema = z.object({
  id: idSchema.describe('Task id to update'),
  task: taskUpdateOptional.describe('Task updated data to save/change'),
  recurrence: recurringPatternSchemaInput.nullable()
})

export const taskCompletionSchema = z.object({
  id: idSchema.describe('Task id'),
  instanceDate: dateSchema.describe('Task instance date'),
  isCompleted: z
    .boolean()
    .describe('If you want to mark as completed - true, opposite - false'),
})

export const getTasksSchema = taskSchema
  .pick({
    title: true,
    importance: true,
    categoryId: true,
    groupId: true,
    assignedUserId: true,
    createdByUserId: true,
    id: true,
  })
  .partial()

export const tasksDue = taskSchemaForDueTask.extend({
  completed: taskCompletedSchema.nullable(),
  recurrence: recurringPatternSchema.nullable(),
})

export const taskDataSchema = taskSchemaOutput.extend({
  completed: z.array(taskCompletedSchema).nullable(),
  recurrence: recurringPatternSchema.nullable(),
})

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

// export type BaseTaskDue = z.infer<typeof tasksDue>

export type TasksCompleted = z.infer<typeof taskCompletedSchema>

// export interface TasksDue extends Selectable<Tasks> {
//   completed: TasksCompleted[] | null
//   recurrence: Selectable<RecurringPattern> | null
// }

export type TasksDue = z.infer<typeof tasksDue>

export type TaskData = z.infer<typeof taskDataSchema>
// export interface TaskData extends Selectable<Tasks> {
//   completed: TasksCompleted[] | null
//   recurrence: Selectable<RecurringPattern> | null
// }

export interface InsertTaskData {
  task: NewTask
  recurrence?: RecurrencePatternInsertable
}
