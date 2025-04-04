import {
  pointsRepository,
  type PointAlterObject,
} from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { alterPointsSchema, pointsSchemaOutput } from '@server/entities/points'
import { TRPCError } from '@trpc/server'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'
import { authenticatedProcedure } from '../../trpc/authenticatedProcedure/index'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/points/alter',
      tags: ['points'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Change user points value',
      description: 'Authenticated procedure to alter user points (add, subtract, equal) ',
      example: {
        request: {
          groupId: 1,
          points: 20,
          action: '+'
        },
      },
    },
  })
  .input(alterPointsSchema)
  .output(pointsSchemaOutput)
  .mutation(async ({ input: pointsData, ctx: { authUser, repos } }) => {
    const currentPoints = pointsData.groupId
      ? await repos.pointsRepository.getPoints({
          userId: authUser.id,
          groupId: pointsData.groupId,
        })
      : await repos.pointsRepository.getPoints({ userId: authUser.id })

    if (!currentPoints) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Not found. User does not have points enabled',
      })
    }

    let points: PointAlterObject

    if (
      pointsData.action === '-' &&
      currentPoints.points <= pointsData.points
    ) {
      points = {
        ...pointsData,
        userId: authUser.id,
        points: 0,
        action: '=',
      }
    } else {
      points = {
        ...pointsData,
        userId: authUser.id,
      }
    }

    const updatedPoints = await repos.pointsRepository.alterPoints(points)

    return updatedPoints
  })
