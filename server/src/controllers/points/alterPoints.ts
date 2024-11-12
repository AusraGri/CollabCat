import {
  pointsRepository,
  type PointAlterObject,
} from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { alterPointsSchema, pointsSchemaOutput } from '@server/entities/points'
import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'

export default publicProcedure
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
  .mutation(async ({ input: pointsData, ctx: { repos } }) => {
    const currectPoints = await repos.pointsRepository.getPoints(
      pointsData.userId
    )

    if (!currectPoints) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'User does not have points',
      })
    }

    let points: PointAlterObject

    if (pointsData.action === '-' && currectPoints.points < pointsData.points) {
      points = {
        ...pointsData,
        points: 0,
        action: '=',
      }
    } else {
      points = {
        ...pointsData,
      }
    }

    const updatedPoints = await repos.pointsRepository.alterPoints(points)

    return updatedPoints
  })
