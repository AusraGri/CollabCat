import { type Request, type Response } from 'express'
import logger from '@server/utils/logger'
import { middleware, publicProcedure } from '../trpc/index'
import { validateAccessToken } from './auth0Middleware'

/**
 * Middleware for validating an access token in the request headers.
 *
 * This middleware:
 * - Validates the JWT access token if it's not in a test environment.
 * - Logs errors if the token validation fails and includes request details such as the IP address, user agent, and error message.
 * - If the token validation succeeds, it calls the next middleware or procedure handler.
 *
 * @param {object} ctx - The context of the request, which includes the request (`req`) and response (`res`) objects.
 * @param {Function} next - The function that invokes the next middleware or handler in the chain.
 * @returns {Promise} - Resolves when the token validation is successful and the next middleware is called.
 * @throws {Error} - Throws an error if the token is invalid or if the request/response objects are missing from the context.
 */
export const validateAccessTokenMiddleware = middleware(
  async ({ ctx, next }) => {
    const { req, res } = ctx

    if (ctx.isTest) return next()

    if (!req || !res) {
      logger.error(
        { path: req?.url, message: 'Missing request/response objects' },
        'Auth Middleware Error'
      )

      throw new Error(
        'Request and response objects are required in the context.'
      )
    }

    await new Promise<void>((resolve, reject) => {
      validateAccessToken(req as Request, res as Response, (err?: unknown) => {
        if (err) {
          logger.warn(
            {
              path: req.url,
              ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'],
              error: err instanceof Error ? err.message : String(err),
            },
            'Failed JWT token validation'
          )

          reject(err instanceof Error ? err : new Error(String(err)))
        } else {
          resolve()
        }
      })
    })

    return next()
  }
)
export const auth0Procedure = publicProcedure.use(validateAccessTokenMiddleware)
