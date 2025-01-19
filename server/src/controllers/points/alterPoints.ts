import {
  pointsRepository,
  type PointAlterObject,
} from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { alterPointsSchema, pointsSchemaOutput } from '@server/entities/points'
import { TRPCError } from '@trpc/server'
import { authenticatedProcedure } from '../../trpc/authenticatedProcedure/index'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/points/alter',
      tags: ['points'],
      summary: 'Add or remove points from the user Points',
      description: 'Public procedure to alter any user points',
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
        message: 'User does not have points enabled',
      })
    }

    let points: PointAlterObject

    if (pointsData.action === '-' && currentPoints.points < pointsData.points) {
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
