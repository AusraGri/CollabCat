import { z } from 'zod'
import type { Rewards } from '@server/database/types'
import { idSchema } from './shared'

export const rewardsSchema = z.object({
  amount: z.number().int().positive().optional(),
  cost: z.number().int().positive(),
  createdByUserId: idSchema,
  groupId: z.number().int().positive().optional(),
  id: idSchema,
  targetUserIds: z.array(idSchema).optional(),
  title: z.string().min(3).max(100),
})
export const rewardsSchemaOutput = z.object({
  amount: z.number().int().positive().nullable(),
  cost: z.number().int().positive(),
  createdByUserId: idSchema,
  groupId: z.number().int().positive().nullable(),
  id: idSchema,
  targetUserIds: z.array(idSchema).nullable(),
  title: z.string().min(3).max(100),
})

export const createRewardSchema = rewardsSchema.omit({
  createdByUserId: true,
  id: true,
})
export const rewardsKeysAll = Object.keys(
  rewardsSchema.shape
) as (keyof Rewards)[]

export type RewardUpdateables = Omit<Rewards, 'createdByUserId' | 'id'>
