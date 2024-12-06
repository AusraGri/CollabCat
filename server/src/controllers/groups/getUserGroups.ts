import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { groupsSchema } from '@server/entities/groups'
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
  .input(z.void())
  .output(groupsSchema.omit({ createdAt: true }).array())
  .query(async ({ ctx: { authUser, repos } }) => {
    const groups = await repos.groupsRepository.getUserGroupsByUserId(authUser.id)

    return groups
  })
