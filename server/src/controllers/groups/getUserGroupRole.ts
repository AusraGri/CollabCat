import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ groupsRepository }))
  .input(
    z.object({
      groupId: idSchema,
    })
  )
  .query(async ({ input: { groupId }, ctx: { authUser, repos } }) => {
    const groupRole = await repos.groupsRepository.getRole({
      groupId,
      userId: authUser.id,
    })

    return groupRole || undefined
  })
