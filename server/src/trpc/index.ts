import { initTRPC } from '@trpc/server'
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express'
import type { Request, Response } from 'express'
import type { AuthUser } from '@server/entities/user'
import type { Database } from '@server/database'
import SuperJSON from 'superjson'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import type { Repositories } from '@server/repositories'
import type { AuthGroup } from '@server/entities/groups'
import { type OpenApiMeta } from 'trpc-openapi'

export type Context = {
  db: Database
  req?: Request
  res?: Response
  authUser?: AuthUser
  userGroup?: AuthGroup
  repos?: Partial<Repositories>
  isTest?: boolean
}

export type ContextMinimal = Pick<Context, 'db'>

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: SuperJSON,
    errorFormatter(opts) {
      const { shape, error } = opts

      if (error.cause instanceof ZodError) {
        const validationError = fromZodError(error.cause)

        return {
          ...shape,
          data: {
            message: validationError.message,
          },
        }
      }

      return shape
    },
  })

export const createContextFactory =
  (db: Database) =>
  ({ req, res }: CreateExpressContextOptions): Context => ({
    db,
    req,
    res,
  })

export const {
  createCallerFactory,
  mergeRouters,
  middleware,
  procedure: publicProcedure,
  router,
} = t
