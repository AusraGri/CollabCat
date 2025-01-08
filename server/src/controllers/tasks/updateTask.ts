import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { taskUpdateSchema } from '@server/entities/tasks'
import { z } from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/tasks/update',
      tags: ['tasks'],
      summary: 'Update task and its recurrence',
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
  .output(z.boolean())
  .mutation(async ({ input: taskData, ctx: { repos } }) => {

    const updatedTask = await repos.tasksRepository.updateTask(taskData)

    return updatedTask
  })
