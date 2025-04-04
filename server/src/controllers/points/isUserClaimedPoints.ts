import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { dateSchema, idSchema } from '@server/entities/shared'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/points/isClaimed',
      tags: ['points'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Check if user already claimed points for the task',
      example: {
        request: {
          taskId: 1,
          taskInstanceDate: '2024-12-12'
        },
      },
    },
  })
  .input(
    z
      .object({
        taskId: idSchema,
        taskInstanceDate: dateSchema.describe('date the task is scheduled')
      })
      .strict()
  )
  .output(z.boolean())
  .query(
    async ({
      input: { taskId, taskInstanceDate },
      ctx: { authUser, repos },
    }) => {

      const queryOptions = {
        taskId,
        taskInstanceDate,
        userId: authUser.id,
      }

      const points = await repos.pointsRepository.getPointClaims(queryOptions)

      return !!points
    }
  )
