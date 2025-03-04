import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { dateSchema, idSchema } from '@server/entities/shared'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/points/claimed/get',
      tags: ['points'],
      protect: true,
      summary: 'Get points of the user',
    },
  })
  .input(
    z
      .object({
        taskId: idSchema,
        taskInstanceDate: dateSchema
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
