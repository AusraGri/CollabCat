import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { taskUpdateSchema, taskSchemaOutput } from '@server/entities/tasks'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/tasks/update',
      tags: ['tasks'],
      summary: 'Update task',
      protect: true,
      example: {
        request: {
          id: 1,
          task: {
            title: 'Updated Title',
          },
        },
      },
    },
  })
  .input(taskUpdateSchema)
  .output(taskSchemaOutput)
  .mutation(async ({ input: taskData, ctx: { repos } }) => {
    const updatedTask = await repos.tasksRepository.update(taskData)

    return updatedTask
  })
