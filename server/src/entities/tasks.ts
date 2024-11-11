import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type {
  Tasks,
  CompletedTasks,
  RecurringPattern,
} from '@server/database/types'
import { idSchema, dateSchema } from './shared'

export const taskSchema = z.object({
  id: idSchema,
  assignedUserId: idSchema,
  categoryId: idSchema,
  isCompleted: z.boolean(),
  completedAt: z.date(),
  createdByUserId: idSchema,
  description: z.string().trim().max(300),
  groupId: idSchema,
  importance: z.string(),
  points: z.number().positive(),
  title: z.string().trim().min(3).max(100),
  startDate: dateSchema,
  endDate: dateSchema,
  isFullDayEvent: z.boolean(),
  parentTaskId: idSchema,
  startTime: dateSchema,
  endTime: dateSchema,
})
const taskOptional = taskSchema
  .omit({
    title: true,
    startDate: true,
    id: true,
    createdByUserId: true,
    parentTaskId: true,
    isCompleted: true,
    completedAt: true,
  })
  .partial()
export const inputTaskSchemaAlter = taskSchema.pick({
  title: true,
  startDate: true,
})
export const inputTaskSchema = inputTaskSchemaAlter.merge(taskOptional)

export const createTaskSchema = z.object({
  startDate: z.date(),
  title: z.string().trim().min(3).max(100),
  assignedUserId: idSchema.optional(),
  categoryId: idSchema.optional(),
  description: z.string().trim().max(300).optional(),
  groupId: idSchema.optional(),
  importance: z.string().optional(),
  points: z.number().positive().optional(),
  endDate: z.date().optional(),
  isFullDayEvent: z.boolean().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
})

export const taskUpdateOptional = taskSchema
  .omit({ id: true, createdByUserId: true })
  .partial()

export const taskUpdateSchema = z.object({
  id: idSchema,
  task: taskUpdateOptional,
})

export const taskCompletionSchema = z.object({
  id: idSchema,
  instanceDate: dateSchema,
  isCompleted: z.boolean(),
})
export const getTasksSchema = z.object({
  title: taskSchema.shape.title.optional(),
  importance: taskSchema.shape.importance.optional(),
  categoryId: taskSchema.shape.categoryId.optional(),
  groupId: taskSchema.shape.groupId.optional(),
  assignedUserId: taskSchema.shape.assignedUserId.optional(),
  createdByUserId: taskSchema.shape.createdByUserId.optional(),
  id: taskSchema.shape.id.optional(),
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

export type TasksUpdateables = Omit<Tasks, 'createdByUserId' | 'id'>

export type InsertableTasks = Insertable<Tasks>

export interface TasksDue extends Selectable<Tasks> {
  completed: Selectable<CompletedTasks> | null
  recurrence: Selectable<RecurringPattern> | null
}
