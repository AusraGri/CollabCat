import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { idSchema, messageOutputSchema } from '@server/entities/shared'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/points/personal/delete',
      tags: ['points'],
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      protect: true,
      summary: 'Delete personal or group points (bank)',
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
  .output(messageOutputSchema)
  .mutation(async ({ input: { groupId }, ctx: { authUser, repos } }) => {
    const deletedPoints = await repos.pointsRepository.deletePoints({
      userId: authUser.id,
      groupId,
    })

    return {
      success: true,
      message: deletedPoints.numDeletedRows
        ? 'Points data successfully deleted.'
        : 'Points data was not found (possibly already deleted).',
    }
  })
