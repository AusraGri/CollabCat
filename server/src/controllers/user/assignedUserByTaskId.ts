import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { idSchema } from '@server/entities/shared'
import { userPublicSchema } from '@server/entities/user'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'
import { authenticatedProcedure } from '../../trpc/authenticatedProcedure/index'

export default authenticatedProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/user/assignedInfo',
      tags: ['user'],
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get assigned user info by task id',
      example: {
        request: {
          taskId: 1,
        },
      },
    },
  })
  .input(
    z.object({
      taskId: idSchema,
    })
  )
  .output(userPublicSchema.or(z.void()))
  .query(async ({ input: { taskId }, ctx: { repos } }) => {
    const users = await repos.userRepository.findAssignedUsersByTaskId(taskId)

    return users
  })
