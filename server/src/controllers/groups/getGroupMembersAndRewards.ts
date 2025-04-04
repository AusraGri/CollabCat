import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { type GroupData } from '@server/entities/groups'
import { groupDataSchema } from '@server/entities/groups'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default groupAuthProcedure
  .use(provideRepos({ groupsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/group/members-rewards',
      tags: ['group'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get group members and rewards of the group',
      example: {
        request: {
          groupId: 1
        },
      },
    },
  })
  .input(z.object({}))
  .output(z.undefined().or(groupDataSchema))
  .query(async ({ ctx: { repos, userGroup } }) => {
    const groupMembersAndRewards: GroupData | undefined =
      await repos.groupsRepository.getGroupMembersAndRewards(userGroup.groupId)

    return groupMembersAndRewards
  })
