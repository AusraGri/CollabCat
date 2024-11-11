import { initTRPC } from '@trpc/server'
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { Request, Response } from 'express'
import type { AuthUser } from '@server/entities/user'
import type { Database } from '@server/database'
import SuperJSON from 'superjson'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import type { Repositories } from '@server/repositories'
import type { AuthGroup } from '@server/entities/groups'
// import { type TRPCPanelMeta } from "trpc-panel";
import {type  OpenApiMeta } from 'trpc-openapi'; // test

export type Context = {
  db: Database

  // Express types. These are optional as
  // vast majority of requests do not need them.
  // Then it is a bit easier to test procedures.
  req?: Request
  res?: Response

  // We can also add our own custom context properties.
  authUser?: AuthUser
  userGroup?: AuthGroup
  // For providing repos in a slightly easier to test way
  repos?: Partial<Repositories>
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

export const createContextFactory = (db: Database) => ({ req, res }: CreateExpressContextOptions): Context => ({
      db,
      req,
      res,
    });

export const {
  createCallerFactory,
  mergeRouters,
  middleware,
  procedure: publicProcedure,
  router,
} = t
