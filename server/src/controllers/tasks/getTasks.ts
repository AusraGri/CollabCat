import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { getTasksSchema, taskDataSchema } from '@server/entities/tasks'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/tasks/get',
      tags: ['tasks'],
      summary: 'Get tasks',
      protect: true,
    },
  })
  .input(getTasksSchema)
  .output(taskDataSchema.array())
  .query(async ({ input: requiredTaskData, ctx: { repos } }) => {
    const taskSearchOptions = {
      ...requiredTaskData
    }

    const tasks = await repos.tasksRepository.getTasks(taskSearchOptions)

    return tasks
  })
