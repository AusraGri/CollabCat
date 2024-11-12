import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import { TRPCError } from '@trpc/server'
import z from 'zod'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/group/remove-user',
      tags: ['group'],
      protect: true,
      summary: 'Remove user from group',
    },
  })
  .input(
    z.object({
      userId: idSchema,
    })
  )
  .output(z.boolean())
  .mutation(async ({ input: user, ctx: { userGroup, repos } }) => {
    if (!userGroup || userGroup.role !== 'Admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User does not have permission to remove user from this group',
      })
    }

    const isUserRemoved = await repos.groupsRepository.removeUser({
      groupId: userGroup.groupId,
      userId: user.userId,
    })

    if (!isUserRemoved) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Failed to remove user from group',
      })
    }

    return !!isUserRemoved
  })
