import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { idSchema } from '@server/entities/shared'

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
  .input(z.object({
    groupId: idSchema.optional()
  }))
  .output(z.boolean())
  .mutation(async ({ input: {groupId}, ctx: { authUser, repos } }) => {
    const deletedPoints = await repos.pointsRepository.deletePoints({
      userId: authUser.id,
      groupId
    })

    return !!deletedPoints.numDeletedRows
  })
