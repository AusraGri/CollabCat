import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { groupsRepository } from '@server/repositories/groupRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ groupsRepository }))

  .input(idSchema)
  .mutation(async ({ input: groupId, ctx: { authUser, repos } }) => {
    const isGroupDeleted = await repos.groupsRepository.delete({
      id: groupId,
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
