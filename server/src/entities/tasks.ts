import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type {
  Tasks,
  CompletedTasks,
  RecurringPattern,
} from '@server/database/types'
import { idSchema } from './shared'

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
  startDate: z.date(),
  endDate: z.date(),
  isFullDayEvent: z.boolean(),
  parentTaskId: idSchema,
  startTime: z.date(),
  endTime: z.date(),
})
const taskOptional = taskSchema.omit({ title: true, startDate: true }).partial()
export const inputTaskSchema = taskSchema
  .pick({ title: true, startDate: true })
  .merge(taskOptional)

export const taskUpdateOptional = taskSchema
  .omit({ id: true, createdByUserId: true })
  .partial()

export const taskUpdateSchema = z.object({
  id: idSchema,
  task: taskUpdateOptional,
})

export const taskCompletionSchema = z.object({
  id: idSchema,
  instanceDate: z.date(),
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
