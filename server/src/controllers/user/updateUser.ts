import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { TRPCError } from '@trpc/server'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'
import { userPublicSchema } from '@server/entities/user'

export default authenticatedProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/user/update',
      tags: ['user'],
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Update user username',
      example: {
        request: {
          username: 'new username',
        },
      },
    },
  })
  .input(
    z.object({
      username: z.string().trim().min(1).max(30),
    })
  )
  .output(userPublicSchema)
  .mutation(async ({ input: userData, ctx: { repos, authUser } }) => {
    const user = await repos.userRepository.findById(authUser.id)

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authorized',
      })
    }

    const encodedUsername = encodeURIComponent(userData.username).replace(
      /%20/g,
      '+'
    )

    const picture = `https://ui-avatars.com/api/?name=${encodedUsername}&size=128&background=random`

    const updatedUserData = user.provider.includes('google')
      ? { ...userData }
      : { ...userData, picture }

    const updatedUser = await repos.userRepository.updateUser(
      authUser.id,
      updatedUserData
    )

    return updatedUser
  })
