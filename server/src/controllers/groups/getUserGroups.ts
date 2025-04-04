import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { groupsSchema } from '@server/entities/groups'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/group/get',
      tags: ['group'],
      protect: true,
      summary: 'Get groups of the user',
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      description: 'This will retrieve all groups that user created',
    },
  })
  .input(z.void())
  .output(groupsSchema.omit({ createdAt: true }).array())
  .query(async ({ ctx: { authUser, repos } }) => {
    const groups = await repos.groupsRepository.getUserGroupsByUserId(
      authUser.id
    )

    return groups
  })
