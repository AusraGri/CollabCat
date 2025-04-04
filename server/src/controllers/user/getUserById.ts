import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { idSchema } from '@server/entities/shared'
import { userPublicSchema } from '@server/entities/user'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/user/get',
      tags: ['user'],
      protect: false,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get user info by user id. Public procedure.',
      example: {
        request: {
          userId: 1
        },
      },
    },
  })
  .input(
    z.object({
      userId: idSchema,
    })
  )
  .output(userPublicSchema.or(z.undefined()))
  .query(async ({ input: { userId }, ctx: { repos } }) => {
    const user = await repos.userRepository.findById(userId)

    return user
  })
