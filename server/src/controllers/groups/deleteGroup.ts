import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import z from 'zod'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/group/remove',
      tags: ['group'],
      protect: true,
      summary: 'Delete group', 
    },
  })
  .input(
    z.object({
    })
  )
  .output(z.boolean())
  .mutation(async ({ ctx: { authUser, userGroup, repos } }) => {
    if (!userGroup || userGroup.role !== 'Admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User does not have permission to delete this group',
      })
    }

    const isGroupDeleted = await repos.groupsRepository.delete({
      id: userGroup.groupId,
      createdByUserId: authUser.id,
    })

    if (!isGroupDeleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Group failed to be deleted',
      })
    }

    return !!isGroupDeleted
  })
