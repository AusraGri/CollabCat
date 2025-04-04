import { validateAccessTokenMiddleware } from '@server/middlewares/trpcAuthMiddleware'
import { publicProcedure } from '..'

export const auth0Procedure = publicProcedure.use(validateAccessTokenMiddleware)
