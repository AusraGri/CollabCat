import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { inputTaskSchema, taskSchemaOutput } from '@server/entities/tasks'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/tasks/create',
      tags: ['tasks'],
      summary: 'Create new task',
      protect: true,
      example: {
        request: {
          title: 'New Task',
          startDate: '2024-11-11',
        },
      },
    },
  })
  .input(inputTaskSchema)
  .output(taskSchemaOutput)
  .mutation(async ({ input: taskData, ctx: { authUser, repos } }) => {
    const task = {
      ...taskData,
      createdByUserId: authUser.id,
    }

    const taskCreated = await repos.tasksRepository.create(task)

    return taskCreated
  })
