import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import provideRepos from '@server/trpc/provideRepos'
import { rewardsRepository } from '@server/repositories/rewardsRepository'
import { idSchema } from '@server/entities/shared'
import { groupsRepository } from '@server/repositories/groupsRepository'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ rewardsRepository, userRepository, groupsRepository }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/rewards/delete',
      tags: ['rewards'],
      summary: 'Delete reward',
      protect: true,
    },
  })
  .input(
    z.object({
      rewardId: idSchema,
    })
  )
  .output(z.boolean())
  .mutation(async ({ input: { rewardId }, ctx: { repos } }) => {
    await repos.rewardsRepository.deleteReward(rewardId)

    return true
  })
