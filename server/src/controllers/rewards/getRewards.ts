import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import provideRepos from '@server/trpc/provideRepos'
import { rewardsRepository } from '@server/repositories/rewardsRepository'
import { rewardsSchemaOutput } from '@server/entities/rewards'
import { idSchema } from '@server/entities/shared'
import { groupsRepository } from '@server/repositories/groupsRepository'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ rewardsRepository, userRepository, groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/rewards/get',
      tags: ['rewards'],
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get rewards by userID or groupID',
      protect: true,
      example: {
        request: {
          groupId: 1,
        },
      },
    },
  })
  .input(
    z
      .object({
        groupId: idSchema.optional(),
      })
      .strict()
  )
  .output(z.array(rewardsSchemaOutput))
  .query(async ({ input: searchData, ctx: { authUser, repos } }) => {
    const searchBy = searchData.groupId
      ? { groupId: searchData.groupId }
      : { createdByUserId: authUser.id }

    const rewards = await repos.rewardsRepository.getRewards(searchBy)

    return rewards
  })
