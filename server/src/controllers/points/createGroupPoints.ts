import { pointsRepository } from '@server/repositories/pointsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { createPointsSchema, pointsSchemaOutput } from '@server/entities/points'
import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { TRPCError } from '@trpc/server'

export default groupAuthProcedure
  .use(provideRepos({ pointsRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/points/group/create',
      tags: ['points'],
      protect: true,
      summary: 'Create new points (bank) for the user in the group',
      description: `Each user in the different group can have a point bank
      and collect points by completing tasks in that group.`,
    },
  })
  .input(createPointsSchema.omit({ groupId: true, points: true }))
  .output(pointsSchemaOutput)
  .mutation(async ({ input: pointsData, ctx: { userGroup, repos } }) => {
    if (pointsData.groupId !== userGroup?.groupId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message:
          'User does not have permission to add points for this group',
      })
    }

    const points = {
      userId: pointsData.userId,
      groupId: userGroup?.groupId,
      points: 0,
    }

    const pointsCreated = await repos.pointsRepository.createPoints(points)

    return pointsCreated
  })
