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
      description:
        'This will remove user from the group, but first you need to have users in your group',
    },
  })
  .input(
    z.object({
      userId: idSchema,
    })
  )
  .output(z.boolean())
  .mutation(async ({ input: user, ctx: { authUser, userGroup, repos } }) => {
    const isAllowed = user.userId === authUser.id || userGroup?.role === 'Admin'

    if (!userGroup || !isAllowed) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized. User does not have permission to remove user from this group',
      })
    }

    const groupMembers = await repos.groupsRepository.getGroupMembers(
      userGroup.groupId
    )

    if (groupMembers.length < 1) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No members found in the group',
      })
    }

    if (!groupMembers.some((member) => member.id === user.userId)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'User not found in the group',
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
