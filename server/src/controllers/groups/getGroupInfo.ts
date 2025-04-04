import { publicProcedure } from '@server/trpc'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'
import { groupPublicSchema } from '@server/entities/groups'

export default publicProcedure
  .use(provideRepos({ groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/group/infoPublic',
      tags: ['group'],
      protect: false,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get group public info, by group id',
      example: {
        request: {
          groupId: 1,
        },
      },
    },
  })
  .input(
    z.object({
      groupId: idSchema,
    })
  )
  .output(groupPublicSchema.or(z.undefined()))
  .query(async ({ input: { groupId }, ctx: { repos } }) => {
    const group = await repos.groupsRepository.getGroup({ id: groupId })

    return group ? group[0] : undefined
  })
