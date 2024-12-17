import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import provideRepos from '@server/trpc/provideRepos'
import { rewardsRepository } from '@server/repositories/rewardsRepository'
import {
  rewardsSchemaOutput,
} from '@server/entities/rewards'
import { groupsRepository } from '@server/repositories/groupsRepository'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ rewardsRepository, userRepository, groupsRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/rewards/get',
      tags: ['rewards'],
      summary: 'Get rewards for the user',
      protect: true,
    },
  })
  .input(z.void())
  .output(z.array(rewardsSchemaOutput))
  .query(async ({ ctx: { authUser, repos } }) => {

    const rewards = await repos.rewardsRepository.getRewards({createdByUserId: authUser.id})

    return rewards
  })
