import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import provideRepos from '@server/trpc/provideRepos'
import { rewardsRepository } from '@server/repositories/rewardsRepository'
import {
  rewardsSchemaOutput,
  updateRewardSchema,
} from '@server/entities/rewards'
import { groupsRepository } from '@server/repositories/groupsRepository'
import { userRepository } from '@server/repositories/userRepository'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ rewardsRepository, userRepository, groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/rewards/update',
      tags: ['rewards'],
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Update reward data',
      protect: true,
      example: {
        request: {
          id: 2,
          groupId: 1,
          cost: 24,
          title: 'updated title',
          amount: 56,
        },
      },
    },
  })
  .input(updateRewardSchema.strict())
  .output(rewardsSchemaOutput)
  .mutation(async ({ input: reward, ctx: { repos } }) => {
    const { id, ...rewardUpdate } = reward

    const updatedReward = await repos.rewardsRepository.updateReward({
      id,
      reward: rewardUpdate,
    })

    return updatedReward
  })
