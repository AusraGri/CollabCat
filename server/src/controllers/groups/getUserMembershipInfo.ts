import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import { memberSchema } from '@server/entities/groups'
import z from 'zod'
import type { GroupMember } from '@server/entities/groups'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'


export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/group/membership',
      tags: ['group'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get group membership info of the user',
      example: {
        request: {
          groupId: 1,
          userId: 1
        },
      },
    },
  })
  .input(
    z.object({
      userId: idSchema.optional(),
    })
  )
  .output(memberSchema)
  .query(async ({ input: { userId }, ctx: { authUser, repos, userGroup } }) => {
    let groupMembership: GroupMember

    if (userId) {
      groupMembership = await repos.groupsRepository.getUserGroupMembershipInfo(
        { userId, groupId: userGroup.groupId }
      )
    } else {
      groupMembership = await repos.groupsRepository.getUserGroupMembershipInfo(
        { userId: authUser.id, groupId: userGroup.groupId }
      )
    }

    return groupMembership
  })
