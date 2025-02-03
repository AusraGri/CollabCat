import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { userPublicSchema } from '@server/entities/user'
import z from 'zod'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .input(z.object({}))
  .output(z.array(userPublicSchema))
  .query(async ({ ctx: { repos, userGroup } }) => {
    const groupMembers = await repos.groupsRepository.getGroupMembers(
      userGroup.groupId
    )

    return groupMembers
  })
