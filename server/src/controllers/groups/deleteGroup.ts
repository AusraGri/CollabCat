import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/group/remove',
      tags: ['group'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Delete group. Only group admin can delete',
      example: {
        request: {
          groupId: 1,
        },
      },
    },
  })
  .input(z.object({}))
  .output(z.boolean())
  .mutation(async ({ ctx: { userGroup, repos } }) => {
    if (userGroup.role !== 'Admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message:
          'Unauthorized. User does not have permission to delete the group',
      })
    }
    const isGroupDeleted = await repos.groupsRepository.deleteGroup(
      userGroup.groupId
    )

    if (!isGroupDeleted.numDeletedRows) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Group failed to be deleted',
      })
    }

    return !!isGroupDeleted
  })
