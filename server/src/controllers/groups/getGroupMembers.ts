import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .input(z.object({}))
  .query(async ({ ctx: { repos, userGroup } }) => {

    if (!userGroup?.groupId) {
        throw new Error('Group ID is missing in the context.');
      }
    const groupMembers = await repos.groupsRepository.getGroupMembers(userGroup.groupId)

    return groupMembers
  })
