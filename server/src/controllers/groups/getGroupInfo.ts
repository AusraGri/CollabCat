import { publicProcedure } from '@server/trpc'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import z from 'zod'

export default publicProcedure
  .use(provideRepos({ groupsRepository }))
  .input(
    z.object({
      groupId: idSchema,
    })
  )
  .query(async ({ input: { groupId }, ctx: { repos } }) => {
    const group = await repos.groupsRepository.getGroup({ id: groupId })

    return group || undefined
  })
