import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import { TRPCError } from '@trpc/server'
import z from 'zod'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))

  .input(z.object({
    id: idSchema,
  })
  .mutation(async ({ input: groupId, ctx: { authUser, userGroupRole, repos } }) => {
    if(userGroupRole !== 'Admin'){
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User does not have permission to delete this group',
      })
    }
    const isGroupDeleted = await repos.groupsRepository.delete({
      groupId,
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
