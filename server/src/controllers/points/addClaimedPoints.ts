import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { pointsClaimedSchema } from '@server/entities/points'
import { dateSchema, idSchema } from '@server/entities/shared'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'
import z from 'zod'
import { authenticatedProcedure } from '../../trpc/authenticatedProcedure/index'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'POST',
      path: '/points/addClaimed',
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      tags: ['points'],
      summary: 'Add claimed points data',
      example: {
        request: {
          taskId: 1,
          taskInstanceDate: '2024-12-12',
        },
      },
    },
  })
  .input(
    z.object({
      taskId: idSchema,
      taskInstanceDate: dateSchema.describe('date when task is scheduled'),
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
