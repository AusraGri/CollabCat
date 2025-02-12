import { publicProcedure } from '@server/trpc'
import z from 'zod'

export default publicProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/health',
      tags: ['health'],
      protect: false,
      summary: 'check trpc health',
    },
  })
  .input(z.void())
  .output(
    z.object({
      status: z.string(),
    })
  )
  .query(async () => ({ status: 'ok' }))
