import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/indexOld'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/points/personal/delete',
      tags: ['points'],
      protect: true,
      summary: 'Delete personal points (bank)',
    },
  })
  .input(z.void())
  .output(z.boolean())
  .mutation(async ({ ctx: { authUser, repos } }) => {
    const deletedPoints = await repos.pointsRepository.deletePoints({
      userId: authUser.id,
    })

    return !!deletedPoints
  })
