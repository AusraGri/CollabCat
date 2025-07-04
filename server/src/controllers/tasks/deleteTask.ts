import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { idSchema, messageOutputSchema } from '@server/entities/shared'
import { z } from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/tasks/delete',
      tags: ['tasks'],
      summary: 'Delete task by task id',
      protect: true,
    },
  })
  .input(
    z.object({
      taskId: idSchema,
    })
  )
  .output(messageOutputSchema)
  .mutation(async ({ input: { taskId }, ctx: { repos } }) => {
    const result = await repos.tasksRepository.deleteTask(taskId)

    return {
      success: true,
      message: result?.numDeletedRows
        ? 'Task successfully deleted.'
        : 'Task was not found (possibly already deleted).',
    }
  })
