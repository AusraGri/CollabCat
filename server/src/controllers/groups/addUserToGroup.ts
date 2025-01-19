import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import { userGroupsSchema } from '@server/entities/groups'
import z from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .use(provideRepos({ groupsRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/group/add',
      tags: ['group'],
      protect: true,
      summary: 'add user to the group',
    },
  })
  .input(
    z.object({
      groupId: idSchema.describe('Group id to add'),
    })
  )
  .output(userGroupsSchema)
  .mutation(async ({ input: { groupId }, ctx: { authUser, repos } }) => {
    const role = 'Member'
    const result = await repos.groupsRepository.addGroupMember({
      groupId,
      userId: authUser.id,
      role,
    })

    return result
  })
