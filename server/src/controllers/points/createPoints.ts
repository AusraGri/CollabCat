import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { pointsSchemaOutput } from '@server/entities/points'
import z from 'zod'
import { idSchema } from '@server/entities/shared'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'POST',
      path: '/points/create',
      tags: ['points'],
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      protect: true,
      summary: 'Create new points (bank) for the user',
      description: `Each user in the different group can have a point bank
      and collect points by completing tasks in that group,
      also points can be personal.`,
      example: {
        request: {
          groupId: 1,
        },
      },
    },
  })
  .input(
    z
      .object({
        groupId: idSchema.optional(),
      })
      .strict()
  )
  .output(pointsSchemaOutput)
  .mutation(async ({ input: { groupId }, ctx: { authUser, repos } }) => {
    const points = {
      userId: authUser.id,
      groupId,
      points: 0,
    }

    const pointsCreated = await repos.pointsRepository.createPoints(points)

    return pointsCreated
  })
