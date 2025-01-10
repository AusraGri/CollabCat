import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { pointsSchemaOutput } from '@server/entities/points'
import { idSchema } from '@server/entities/shared'
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
  .input(z.object({
    groupId: idSchema.optional()
  }))
  .output(pointsSchemaOutput.optional())
  .query(async ({ input: {groupId}, ctx: { authUser, repos } }) => {

    const queryOptions = groupId ? {userId: authUser.id, groupId} : {userId: authUser.id}

    const points = await repos.pointsRepository.getPoints(queryOptions)

    return points
  })
