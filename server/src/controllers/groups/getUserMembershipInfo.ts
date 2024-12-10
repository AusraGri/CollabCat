import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import z from 'zod'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .input(
    z.object({
      userId: idSchema.optional(),
    })
  )
  .query(async ({ input: { userId }, ctx: { authUser, repos, userGroup } }) => {
    let groupMembership
    if (!userGroup?.groupId) {
      throw new Error('Group ID is missing in the context.')
    }

    if (userId) {
      groupMembership = await repos.groupsRepository.getUserGroupMembershipInfo(
        { userId, groupId: userGroup.groupId }
      )
    } else {
      groupMembership = await repos.groupsRepository.getUserGroupMembershipInfo(
        { userId: authUser.id, groupId: userGroup.groupId }
      )
    }

    return groupMembership
  })
