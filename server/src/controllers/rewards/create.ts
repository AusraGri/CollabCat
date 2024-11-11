import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { rewardsRepository } from '@server/repositories/rewardsRepository'
import { createRewardSchema } from '@server/entities/rewards'
import { groupsRepository } from '@server/repositories/groupsRepository'
import { userRepository } from '@server/repositories/userRepository'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ rewardsRepository, userRepository, groupsRepository }))
  .input(createRewardSchema)
  .mutation(async ({ input: rewardData, ctx: { authUser, repos } }) => {
    if (
      rewardData.groupId !== undefined &&
      rewardData.targetUserIds !== undefined &&
      rewardData.targetUserIds.length > 0
    ) {
      const [isGroup] = await repos.groupsRepository.get({
        id: rewardData.groupId,
      })

      if (!isGroup)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid group provided',
        })

      const users = await repos.userRepository.findById(
        rewardData.targetUserIds
      )

      if (users.length === 0)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid reward targets',
        })
    }

    const reward = {
      ...rewardData,
      createdByUserId: authUser.id,
    }

    const rewardCreated = await repos.rewardsRepository.createReward(reward)

    return rewardCreated
  })
