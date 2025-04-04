import { z } from 'zod'
import type { RewardClaims, Rewards } from '@server/database/types'
import { idSchema } from './shared'

export const rewardsSchema = z.object({
  amount: z
    .number()
    .int()
    .min(0)
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
  amount: z.number().int().min(0).nullable(),
  cost: z.number().int().positive(),
  createdByUserId: idSchema,
  groupId: z.number().int().positive().nullable(),
  id: idSchema,
  targetUserIds: z.array(idSchema).nullable(),
  title: z.string().min(3).max(100),
})
export const rewardClaimsSchema = z.object({
  userId: idSchema,
  id: idSchema,
  rewardId: idSchema,
  claimedAt: z.date(),
})

export const createRewardSchema = rewardsSchema.omit({
  createdByUserId: true,
  id: true,
})

export const updateRewardSchema = z.object({
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
    .optional()
    .describe('The needed points to claim the reward'),
  groupId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('To what group reward is created'),
  id: idSchema.describe('reward id to update'),
  targetUserIds: z
    .array(idSchema)
    .optional()
    .describe('For making reward available for picked users only'),
  title: z.string().trim().min(3).max(100).optional(),
  createdByUserId: idSchema
    .optional()
    .describe('This value at the moment is not allowed to change.'),
})
export const rewardsKeysAll = Object.keys(
  rewardsSchema.shape
) as (keyof Rewards)[]

export const rewardClaimsKeysAll = Object.keys(
  rewardClaimsSchema.shape
) as (keyof RewardClaims)[]

export type InsertableReward = z.infer<typeof createRewardSchema>
export type PublicReward = z.infer<typeof rewardsSchemaOutput>

export type RewardUpdateable = z.infer<typeof updateRewardSchema>
