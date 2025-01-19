import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { pointsSchemaOutput } from '@server/entities/points'
import z from 'zod'
import { idSchema } from '@server/entities/shared'

export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/points/create',
      tags: ['points'],
      protect: true,
      summary: 'Create new points (bank) for the user',
      description: `Each user in the different group can have a point bank
      and collect points by completing tasks in that group,
      also points can be personal.`,
    },
  })
  .input(
    z.object({
      groupId: idSchema.optional(),
    })
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
