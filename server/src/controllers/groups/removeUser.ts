import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import { TRPCError } from '@trpc/server'
import z from 'zod'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))

  .input(z.object({
    id: idSchema
  }))
  .mutation(async ({ input: user, ctx: { userGroup, repos } }) => {
    if(!userGroup || userGroup.role !== 'Admin'){
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User does not have permission to delete this group',
      })
    }

    const isUserRemoved = await repos.groupsRepository.removeUser({
      groupId: userGroup.groupId,
      userId: user.id,
    })

    if (!isUserRemoved) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Failed to remove user from group',
      })
    }

    return !!isUserRemoved
  })
