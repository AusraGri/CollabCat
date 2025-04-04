import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import provideRepos from '@server/trpc/provideRepos'
import { rewardsRepository } from '@server/repositories/rewardsRepository'
import { idSchema, messageOutputSchema } from '@server/entities/shared'
import { groupsRepository } from '@server/repositories/groupsRepository'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ rewardsRepository, userRepository, groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/rewards/delete',
      tags: ['rewards'],
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Delete reward by reward id',
      protect: true,
      example: {
        request: {
          rewardId: 1,
        },
      },
    },
  })
  .input(
    z.object({
      rewardId: idSchema,
    })
  )
  .output(messageOutputSchema)
  .mutation(async ({ input: { rewardId }, ctx: { repos } }) => {
    const result = await repos.rewardsRepository.deleteReward(rewardId)

    return {
      success: true,
      message: result.numDeletedRows
        ? 'Reward data successfully deleted.'
        : 'Reward data was not found (possibly already deleted).',
    }
  })
