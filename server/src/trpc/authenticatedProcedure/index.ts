import config from '@server/config'
import { TRPCError } from '@trpc/server'
import { userRepository } from '@server/repositories/userRepository'
import { auth0Procedure } from '@server/trpc/auth0Procedure'
import logger from '@server/utils/logger'
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

      logger.warn(`Missing request: ${message}`)

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message,
      })
    }

    if (!ctx.req.auth || !ctx.req.auth.payload) {
      logger.warn(
        {
          path: ctx.req.url,
          ip:
            ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress,
          reason: 'Token is missing or not validated',
        },
        'Unauthorized request'
      )

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Token is not validated',
      })
    }

    const { token } = ctx.req.auth
    const { sub } = ctx.req.auth.payload

    if (!token || !sub) {
      logger.warn(
        {
          path: ctx.req.url,
          ip:
            ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress,
          reason: 'No token or subject (sub) found',
        },
        'Unauthenticated request'
      )

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthenticated. Please log in.',
      })
    }

    const user = await ctx.repos.userRepository.findByAuth0Id(sub)

    if (!user) {
      logger.warn(
        {
          path: ctx.req.url,
          ip:
            ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress,
          auth0Id: sub,
          reason: 'User not found in the database',
        },
        'Unauthenticated request'
      )

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthenticated. Invalid token.',
      })
    }

    logger.info(
      {
        path: ctx.req.url,
        ip: ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress,
        userId: user.id,
        email: user.email,
      },
      'User authenticated successfully'
    )

    return next({
      ctx: {
        authUser: { id: user.id, email: user.email },
      },
    })
  })
