import { type Request, type Response } from 'express'
import logger from '@server/utils/logger'
import { middleware, publicProcedure } from '../trpc/index'
import { validateAccessToken } from './auth0Middleware'

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
