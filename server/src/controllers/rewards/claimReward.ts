import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import provideRepos from '@server/trpc/provideRepos'
import { rewardsRepository } from '@server/repositories/rewardsRepository'
import { idSchema } from '@server/entities/shared'
import { pointsRepository } from '@server/repositories/pointsRepository'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { rewardClaimsSchema } from '@server/entities/rewards'

export default authenticatedProcedure
  .use(provideRepos({ rewardsRepository, pointsRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/rewards/claim',
      tags: ['rewards'],
      summary: 'Claim reward',
      protect: true,
    },
  })
  .input(
    z
      .object({
        rewardId: idSchema,
        groupId: idSchema.optional(),
      })
      .strict()
  )
  .output(rewardClaimsSchema)
  .mutation(
    async ({ input: { rewardId, groupId }, ctx: { authUser, repos } }) => {
      const [reward] = await repos.rewardsRepository.getRewards({
        id: rewardId,
      })

      if (!reward) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reward was not found in the database',
        })
      }

      if (reward.targetUserIds) {
        if (!reward.targetUserIds.includes(authUser.id)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message:
              'Unauthorized. User is restricted from claiming this reward',
          })
        }
      }

      let updatedRewardAmount: number | undefined

      if (reward.amount === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reward amount is not sufficient',
        })
      }

      if (reward.amount && reward.amount > 0) {
        updatedRewardAmount = reward.amount - 1
      }

      const userPoints = await repos.pointsRepository.getPoints({
        userId: authUser.id,
        groupId,
      })

      if (!userPoints || userPoints.points < reward.cost) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'User has insufficient points to claim the reward',
        })
      }

      const updatedPoints = userPoints.points - reward.cost

      const result = await repos.rewardsRepository.claimReward({
        userId: authUser.id,
        updatedPoints,
        rewardId,
        groupId,
        rewardAmount: updatedRewardAmount,
      })

      return result
    }
  )
