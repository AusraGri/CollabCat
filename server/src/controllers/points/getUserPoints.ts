import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { pointsSchemaOutput } from '@server/entities/points'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/points/personal/get',
      tags: ['points'],
      protect: true,
      summary: 'Get points of the user',
    },
  })
  .input(z.void())
  .output(pointsSchemaOutput)
  .query(async ({ ctx: { authUser, repos } }) => {

    const points = await repos.pointsRepository.getPoints(authUser.id)

    return points
  })
