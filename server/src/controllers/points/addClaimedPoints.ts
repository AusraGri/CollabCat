import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { pointsClaimedSchema } from '@server/entities/points'
import { idSchema } from '@server/entities/shared'
import z from 'zod'
import { authenticatedProcedure } from '../../trpc/authenticatedProcedure/index'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/points/addClaimed',
      tags: ['points'],
      summary: 'Add claimed points data',
    },
  })
  .input(
    z.object({
      taskId: idSchema,
      taskInstanceDate: z.date(),
    })
  )
  .output(pointsClaimedSchema)
  .mutation(
    async ({
      input: { taskId, taskInstanceDate },
      ctx: { authUser, repos },
    }) => {
      const claimed = await repos.pointsRepository.addPointClaims({
        userId: authUser.id,
        taskId,
        taskInstanceDate,
      })

      return claimed
    }
  )
