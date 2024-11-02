import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
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
      groupId: idSchema,
    })
  )
  .use(async ({ input: { groupId }, ctx, next }) => {
    const { authUser, repos } = ctx;
    const userGroupRole = await repos.groupsRepository.getRole({
      userId: authUser.id,
      groupId,
    });

    if (userGroupRole.role === undefined) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `User is not in this group`,
      });
    }

    // Add the role to the context
    ctx.userGroupRole = userGroupRole.role;

    return next({
      ctx: {
        ...ctx,
        userGroupRole: userGroupRole.role,
      },
    });
  });
