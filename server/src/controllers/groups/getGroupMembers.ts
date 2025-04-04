import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { userPublicSchema } from '@server/entities/user'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/group/members',
      tags: ['group'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get group members of the group',
      example: {
        request: {
          groupId: 1,
        },
      },
    },
  })
  .input(z.object({}))
  .output(z.array(userPublicSchema))
  .query(async ({ ctx: { repos, userGroup } }) => {
    const groupMembers = await repos.groupsRepository.getGroupMembers(
      userGroup.groupId
    )

    return groupMembers
  })
