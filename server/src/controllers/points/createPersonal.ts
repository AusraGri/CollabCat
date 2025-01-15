import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { pointsSchemaOutput } from '@server/entities/points'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/points/personal/create',
      tags: ['points'],
      protect: true,
      summary: 'Create new points (bank) for the user',
      description: `Each user in the different group can have a point bank
      and collect points by completing tasks in that group,
      also points can be personal.`,
    },
  })
  .input(z.void())
  .output(pointsSchemaOutput)
  .mutation(async ({ ctx: { authUser, repos } }) => {
    const points = {
      userId: authUser.id,
    }

    const pointsCreated = await repos.pointsRepository.createPoints(points)

    return pointsCreated
  })
