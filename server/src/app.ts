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

  // app.use(cors());
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

  // log requests to the API
  app.use((req, res, next) => {
    // console.log("REQUEST START:")
    // console.log('Incoming Request Method:', req.method);
    // console.log('Incoming Request URL:',req.url);
    // console.log('Incoming Request Header:', req.headers);
    // console.log('Incoming Request Header:', req.body);
    next()
  })

  // validation applied to all endpoints
  // app.use(validateAccessToken)

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

  // if (config.env === 'development') {
  //   app.use('/api/v1/trpc-panel', (_, res) =>
  //     res.send(
  //       renderTrpcPanel(appRouter, {
  //         url: `http://localhost:${config.port}/api/v1/trpc`,
  //         transformer: 'superjson',
  //       })
  //     )
  //   )
  // }

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
