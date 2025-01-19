import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema } from '@server/entities/shared'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/tasks/delete',
      tags: ['tasks'],
      summary: 'Delete task',
      protect: true,
    },
  })
  .input(
    z.object({
      taskId: idSchema,
    })
  )
  .output(z.boolean())
  .mutation(async ({ input: { taskId }, ctx: { repos } }) => {
    const result = await repos.tasksRepository.delete(taskId)

    if (!result.numDeletedRows) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tasks were not found. Failed to delete',
      })
    }

    return true
  })
