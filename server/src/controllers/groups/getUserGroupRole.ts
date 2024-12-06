import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/indexOld'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ groupsRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/group/get',
      tags: ['group'],
      protect: true,
      summary: 'Get groups of the user',
      description: 'This will retrieve all groups that you created',
    },
  })
  .input(
    z.object({
      groupId: idSchema,
    })
  )
  .output(
    z.union([
        z.object({
          role: z.string(),
        }),
        z.undefined(),
      ])
  )
  .query(async ({ input: { groupId }, ctx: { authUser, repos } }) => {
    const groupRole = await repos.groupsRepository.getRole({ groupId, userId: authUser.id })

    return groupRole || undefined
  })
