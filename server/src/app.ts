import express from 'express'
import {
  createExpressMiddleware,
  type CreateExpressContextOptions,
} from '@trpc/server/adapters/express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { createOpenApiExpressMiddleware } from 'trpc-openapi'
import type { Database } from './database'
import { appRouter } from './controllers'
import type { Context } from './trpc'
import config from './config'
import { openApiDocument } from './trpc/openApi'

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

  app.use('/api/health', (_, res) => {
    res.status(200).send('OK')
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

  app.use('/', swaggerUi.serve)
  app.get('/', swaggerUi.setup(openApiDocument))

  return app
}
