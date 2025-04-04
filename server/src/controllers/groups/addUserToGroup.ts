import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import { userGroupsSchema } from '@server/entities/groups'
import z from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'POST',
      path: '/group/addUser',
      tags: ['group'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Add user to the group (needs to be authenticated first)',
      example: {
        request: {
          groupId: 345,
        },
      },
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
