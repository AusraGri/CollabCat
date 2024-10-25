import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type { Tasks } from '@server/database/types'
import { idSchema } from './shared'
import tasks from '@server/controllers/tasks'

export const taskSchema = z.object({
  id: idSchema,
  assignedUserId: idSchema,
  categoryId: idSchema,
  completed: z.boolean(),
  completedAt: z.date(),
  createdByUserId: idSchema,
  deadline: z.date(),
  description: z.string().trim().max(300),
  groupId: idSchema,
  importance: z.string(),
  points: z.number().positive(),
  title: z.string().trim().min(3).max(100),
})

export const inputTaskSchema = z.object({
  title: taskSchema.shape.title,
  importance: taskSchema.shape.importance.optional(),
  categoryId: taskSchema.shape.categoryId.optional(),
  deadline: taskSchema.shape.deadline.optional(),
  description: taskSchema.shape.description.optional(),
  points: taskSchema.shape.points.optional(),
  groupId: taskSchema.shape.groupId.optional(),
})
export const getTasksSchema = z.object({
  title: taskSchema.shape.title.optional(),
  importance: taskSchema.shape.importance.optional(),
  categoryId: taskSchema.shape.categoryId.optional(),
  deadline: taskSchema.shape.deadline.optional(),
  groupId: taskSchema.shape.groupId.optional(),
  assignedUserId: taskSchema.shape.assignedUserId.optional(),
  createdByUserId: taskSchema.shape.createdByUserId.optional(),
  id: taskSchema.shape.id.optional(),
})

export const tasksKeysAll = Object.keys(taskSchema.shape) as (keyof Tasks)[]

export const tasksKeysPublic = [
  'id',
  'assignedUserId',
  'categoryId',
  'completed',
  'createdByUserId',
  'deadline',
  'description',
  'groupId',
  'importance',
  'points',
  'title',
] as const

export type TasksPublic = Pick<
  Selectable<Tasks>,
  (typeof tasksKeysPublic)[number]
>

export type InsertableTasks = Insertable<Tasks>
