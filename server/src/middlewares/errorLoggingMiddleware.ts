import logger from '@server/utils/logger'
import { TRPCError } from '@trpc/server'
import { middleware} from '../trpc/index'

export const errorLoggingMiddleware = middleware(
  async ({ ctx, path, type, next }) => {
    const resp = await next()

    if (!resp.ok) {
      const { error } = resp
      let trpcError: TRPCError

      if (error instanceof TRPCError) {
        trpcError = error
      } else {
        trpcError = new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: error,
        })
      }

      logger.error(
        {
          procedure: path,
          type,
          message: trpcError.message,
          code: trpcError.code,
          cause: trpcError.cause,
          user: ctx.authUser ? { id: ctx.authUser.id } : 'Unknown',
          group: ctx.userGroup || 'None',
          ip:
            ctx.req?.headers['x-forwarded-for'] ||
            ctx.req?.socket.remoteAddress,
        },
        `❌ tRPC Error: ${trpcError.message}`
      )

      throw trpcError
    }

    return resp
  }
)
