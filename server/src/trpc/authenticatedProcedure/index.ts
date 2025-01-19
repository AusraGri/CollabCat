import config from '@server/config'
import { TRPCError } from '@trpc/server'
import { userRepository } from '@server/repositories/userRepository'
import { auth0Procedure } from '@server/middlewares/trpcAuthMiddleware'
import provideRepos from '../provideRepos'

export const authenticatedProcedure = auth0Procedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .use(async ({ ctx, next }) => {
    if (ctx.authUser) {
      return next({
        ctx: {
          authUser: ctx.authUser,
        },
      })
    }

    if (!ctx.req) {
      const message =
        config.env === 'development' || config.env === 'test'
          ? 'Missing Express request object. If you are running tests, make sure to provide some req object in the procedure context.'
          : 'Missing Express request object.'

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message,
      })
    }

    if (!ctx.req.auth || !ctx.req.auth.payload) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Token is not validated',
      })
    }

    const { token } = ctx.req.auth
    const { sub } = ctx.req.auth.payload

    if (!token || !sub) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthenticated. Please log in.',
      })
    }

    const user = await ctx.repos.userRepository.findByAuth0Id(sub)

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthenticated. Invalid token.',
      })
    }

    return next({
      ctx: {
        authUser: { id: user.id, email: user.email },
      },
    })
  })
