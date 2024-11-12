import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { insertGroupSchema, groupsSchema } from '@server/entities/groups'

export default authenticatedProcedure
  .use(provideRepos({ groupsRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/group/create',
      tags: ['group'],
      protect: true,
      summary: 'Create new Group',
    },
  })
  .input(insertGroupSchema)
  .output(groupsSchema.omit({ createdAt: true }))
  .mutation(async ({ input: groupData, ctx: { authUser, repos } }) => {
    const group = {
      ...groupData,
      createdByUserId: authUser.id,
    }

    const groupCreated = await repos.groupsRepository.create(group)

    return groupCreated
  })
