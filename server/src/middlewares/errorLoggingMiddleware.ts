import logger from '@server/utils/logger'
import { TRPCError } from '@trpc/server'
import { middleware } from '../trpc/index'

/**
 * Middleware for logging errors in tRPC procedures.
 *
 * This middleware:
 * - Catches errors in tRPC procedures and logs them
 * - Logs detailed information about the error, including:
 *   - The procedure path and type
 *   - The error message, code, and cause
 *   - The user ID (if authenticated)
 *   - The user group (if available)
 *   - The client's IP address
 *
 * It then re-throws the error so that it can be handled downstream.
 *
 * @param {object} ctx - The context of the request, including authentication info and request headers.
 * @param {string} path - The path of the procedure (used for logging).
 * @param {string} type - The type of request (e.g., query, mutation) (used for logging).
 * @param {Function} next - A function that invokes the next middleware or procedure handler.
 * @returns {Promise} - Resolves to the response from the next handler or middleware.
 * @throws {TRPCError} - Throws a TRPC error if the response contains an error.
 */
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
