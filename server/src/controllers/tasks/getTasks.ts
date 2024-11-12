import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { getTasksSchema, taskSchemaOutput } from '@server/entities/tasks'
import { TRPCError } from '@trpc/server'

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
  .output(taskSchemaOutput.array())
  .query(async ({ input: requiredTaskData, ctx: { authUser, repos } }) => {
    const taskSearchOptions = {
      ...requiredTaskData,
      createdByUserId: authUser.id,
    }

    const tasks = await repos.tasksRepository.getTasks(taskSearchOptions)

    if (!tasks?.length) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tasks were not found',
      })
    }

    return tasks
  })
