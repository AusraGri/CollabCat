import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Points } from '@server/database/types'
import { idSchema } from './shared'

export const pointsSchema = z.object({
  userId: idSchema,
  createdAt: z.date(),
  groupId: idSchema,
  points: z.number().int().positive()

})

export const createPointsSchema = pointsSchema.omit({ userId: true, createdAt: true }).extend({
  groupId: idSchema.optional()
});

export const alterPointsSchema = createPointsSchema.extend({
  action: z.enum(['+', '-'])
})
export const pointsKeysAll = Object.keys(pointsSchema.shape) as (keyof Points)[]

export const pointsKeysPublic = ['userId', 'groupId', 'points'] as const

export type PointsPublic = Pick<Selectable<Points>, (typeof pointsKeysPublic)[number]>

