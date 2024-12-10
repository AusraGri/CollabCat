import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { idSchema } from '@server/entities/shared'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '../provideRepos'

export const groupAuthProcedure = authenticatedProcedure
  .use(
    provideRepos({
      groupsRepository,
    })
  )
  .input(
    z.object({
      groupId: idSchema.describe('Group id on witch user acts'),
    })
  )
  .use(async ({ input: { groupId }, ctx, next }) => {
    const { authUser, repos } = ctx

    const [isGroup] = await repos.groupsRepository.getGroup({ id: groupId })

    if (!isGroup) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Group does not exist`,
      })
    }

    const userGroupRole = await repos.groupsRepository.getRole({
      userId: authUser.id,
      groupId: isGroup.id,
    })

    if (!userGroupRole || userGroupRole.role === undefined) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `Unauthorized: user is not in this group`,
      })
    }

    // Add the role and groupId to the context
    ctx.userGroup = {
      role: userGroupRole.role,
      groupId: isGroup.id,
    }

    return next({
      ctx: {
        ...ctx,
      },
    })
  })
