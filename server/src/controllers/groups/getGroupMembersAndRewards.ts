import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { type GroupData } from '@server/entities/groups'
import { groupDataSchema } from '@server/entities/groups'
import z from 'zod'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .input(z.object({}))
  .output(z.undefined().or(groupDataSchema))
  .query(async ({ ctx: { repos, userGroup } }) => {
    if (!userGroup?.groupId) {
      throw new Error('Group ID is missing in the context.')
    }

    const groupMembersAndRewards: GroupData | undefined =
      await repos.groupsRepository.getGroupMembersAndRewards(userGroup.groupId)

    return groupMembersAndRewards
  })
