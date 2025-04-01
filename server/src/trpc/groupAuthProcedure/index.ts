import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { idSchema } from '@server/entities/shared'
import { groupsRepository } from '@server/repositories/groupsRepository'
import logger from '@server/utils/logger'
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

    if (!ctx.userGroup) {
      const [isGroup] = await repos.groupsRepository.getGroup({ id: groupId })

      if (!isGroup) {
        logger.warn(
          {
            userId: authUser.id,
            groupId,
            reason: 'Group does not exist',
          },
          'Unauthenticated request for the group. Group does not exist'
        )

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
        logger.warn(
          {
            userId: authUser.id,
            groupId: isGroup.id,
            role: userGroupRole?.role,
            reason: 'User is not authorized to act in this group',
          },
          `Unauthorized request for the group ID ${isGroup.id}. User ID ${authUser.id} is not authorized to act in this group`
        )

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: `Unauthorized: user is not in this group`,
        })
      }

      ctx.userGroup = {
        role: userGroupRole.role,
        groupId: isGroup.id,
      }

      logger.info(
        {
          userId: authUser.id,
          groupId: isGroup.id,
          role: userGroupRole.role,
          message: 'User successfully authorized to act in the group',
        },
        'User is authorized to act in the group'
      )
    }

    return next({
      ctx: {
        ...ctx,
        userGroup: ctx.userGroup,
      },
    })
  })
