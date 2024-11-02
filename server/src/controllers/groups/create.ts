import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { insertGroupSchema } from '@server/entities/groups'

export default authenticatedProcedure
  .use(provideRepos({ groupsRepository }))

  .input(insertGroupSchema)
  .mutation(async ({ input: groupData, ctx: { authUser, repos } }) => {
    const group = {
      ...groupData,
      createdByUserId: authUser.id,
    }

    const taskCreated = await repos.groupsRepository.create(group)

    return taskCreated
  })
