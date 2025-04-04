import express from 'express'
import {
  createExpressMiddleware,
  type CreateExpressContextOptions,
} from '@trpc/server/adapters/express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { createOpenApiExpressMiddleware } from 'trpc-openapi'
import { sql } from 'kysely'
import type { Database } from './database'
import { appRouter } from './controllers'
import type { Context } from './trpc'
import config from './config'
import { openApiDocument } from './trpc/openApi'
import logger from './utils/logger'

export default function createApp(db: Database) {
  const app = express()

  app.use(
    cors({
      origin: config.auth0.clientOriginUrl,
      allowedHeaders: ['Authorization', 'Content-Type'],
      maxAge: 86400,
    })
  )

  app.use(express.json())

  app.use('/api/health', async (_, res) => {
    try {
      await sql`SELECT 1`.execute(db)
      res.status(200).json({ status: 'OK', database: 'connected' })
    } catch (error) {
      logger.error('❌ Database health check failed!', { error })
      res.status(500).json({ status: 'ERROR', database: 'disconnected' })
    }
  })

  app.use(
    '/api/v1/trpc',
    createExpressMiddleware({
      createContext: ({ req, res }: CreateExpressContextOptions): Context => ({
        db,
        req,
        res,
      }),
      router: appRouter,
    })
  )


  app.use(
    '/api',
    createOpenApiExpressMiddleware({
      router: appRouter,
      createContext: ({ req, res }: CreateExpressContextOptions): Context => ({
        db,
        req,
        res,
      }),
    })
  )

  app.use('/docs', swaggerUi.serve)
  app.get(
    '/docs',
    swaggerUi.setup(openApiDocument, {
      swaggerOptions: {
        oauth2RedirectUrl: 'http://localhost:3000/docs/oauth2-redirect.html',
        oauth: {
          clientId: config.auth0.clientId,
          scopes: 'openid profile email',
        },
      },
    })
  )

  return app
}
