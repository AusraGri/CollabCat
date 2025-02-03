import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import provideRepos from '@server/trpc/provideRepos'
import { rewardsRepository } from '@server/repositories/rewardsRepository'
import {
  rewardsSchemaOutput,
  updateRewardSchema,
} from '@server/entities/rewards'
import { groupsRepository } from '@server/repositories/groupsRepository'
import { userRepository } from '@server/repositories/userRepository'

export default authenticatedProcedure
  .use(provideRepos({ rewardsRepository, userRepository, groupsRepository }))
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/rewards/update',
      tags: ['rewards'],
      summary: 'Update reward',
      protect: true,
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
