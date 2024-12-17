import { z } from 'zod'
import type { Rewards } from '@server/database/types'
import { idSchema } from './shared'

export const rewardsSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Amount of reward claims'),
  cost: z
    .number()
    .int()
    .positive()
    .describe('The needed points to claim the reward'),
  createdByUserId: idSchema,
  groupId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('To what group reward is created'),
  id: idSchema,
  targetUserIds: z
    .array(idSchema)
    .optional()
    .describe('For making reward available for picked users only'),
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

export type InsertableReward = z.infer<typeof createRewardSchema>
export type PublicReward = z.infer<typeof rewardsSchemaOutput>

export type RewardUpdateables = Omit<Rewards, 'createdByUserId' | 'id'>
