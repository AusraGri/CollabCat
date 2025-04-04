import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import provideRepos from '@server/trpc/provideRepos'
import { rewardsRepository } from '@server/repositories/rewardsRepository'
import {
  createRewardSchema,
  rewardsSchemaOutput,
} from '@server/entities/rewards'
import { groupsRepository } from '@server/repositories/groupsRepository'
import { userRepository } from '@server/repositories/userRepository'
import { TRPCError } from '@trpc/server'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ rewardsRepository, userRepository, groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'POST',
      path: '/rewards/create',
      tags: ['rewards'],
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Create new reward for the user or the group',
      protect: true,
      example: {
        request: {
          groupId: 1,
        },
      },
    },
  })
  .input(createRewardSchema)
  .output(rewardsSchemaOutput)
  .mutation(async ({ input: rewardData, ctx: { authUser, repos } }) => {
    if (rewardData.groupId !== undefined) {
      const [isGroup] = await repos.groupsRepository.getGroup({
        id: rewardData.groupId,
      })

      if (!isGroup)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Not found: invalid group provided',
        })
    }

    const reward = {
      ...rewardData,
      createdByUserId: authUser.id,
    }

    const rewardCreated = await repos.rewardsRepository.createReward(reward)

    return rewardCreated
  })
