import {
  pointsRepository,
  type PointAlterObject,
} from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { alterPointsSchema, pointsSchemaOutput } from '@server/entities/points'
import { publicProcedure } from '@server/trpc'

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
    const currentPoints = await repos.pointsRepository.getPoints(
      pointsData.userId
    )

    let points: PointAlterObject

    if (pointsData.action === '-' && currentPoints.points < pointsData.points) {
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
