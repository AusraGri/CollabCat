import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Points } from '@server/database/types'
import { idSchema } from './shared'

export const pointsSchema = z.object({
  userId: idSchema.describe('Owner of the points'),
  createdAt: z.date(),
  groupId: idSchema.describe('Group id to which points are related'),
  points: z.number().int().positive(),
})

export const deletePointsSchema = z.object({
  userId: idSchema,
  groupId: idSchema.optional(),
})
export const pointsSchemaOutput = z.object({
  userId: idSchema,
  groupId: idSchema.nullable(),
  points: z.number().int().positive(),
})

export const createPointsSchema = pointsSchema
  .omit({ createdAt: true, points: true })
  .extend({
    groupId: idSchema.optional(),
    points: pointsSchema.shape.points.optional(),
  })

export const alterPointsSchema = pointsSchema.omit({ createdAt: true }).extend({
  action: z
    .enum(['+', '-', '='])
    .describe(
      "'+' for adding points and '-' for removing, '=' to equal amount of points for user point (bank)"
    ),
})
export const pointsKeysAll = Object.keys(pointsSchema.shape) as (keyof Points)[]

export const pointsKeysPublic = ['userId', 'groupId', 'points'] as const

export type PointsPublic = Pick<
  Selectable<Points>,
  (typeof pointsKeysPublic)[number]
>
