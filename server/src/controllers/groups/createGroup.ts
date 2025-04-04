import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { insertGroupSchema, groupsSchema } from '@server/entities/groups'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'POST',
      path: '/group/create',
      tags: ['group'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Create new Group',
      example: {
        request: {
          name: 'New Group'
        },
      },
    },
  })
  .input(insertGroupSchema)
  .output(groupsSchema.omit({ createdAt: true }))
  .mutation(async ({ input: groupData, ctx: { authUser, repos } }) => {
    const group = {
      ...groupData,
      createdByUserId: authUser.id,
    }

    const groupCreated = await repos.groupsRepository.createGroup(group)

    return groupCreated
  })
