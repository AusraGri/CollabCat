import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { dateSchema } from '@server/entities/shared'
import isTaskDue from '@server/utils/isTaskDue'
import { taskDataSchema } from '@server/entities/tasks'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/tasks/daily',
      tags: ['tasks'],
      summary: 'Get tasks for the given date',
      protect: true,
      example: {
        request: {
          date: '2024-11-11',
        },
      },
    },
  })
  .input(z.object({ date: dateSchema }))
  .output(taskDataSchema.array())
  .query(async ({ input: { date }, ctx: { authUser, repos } }) => {
    const tasks = await repos.tasksRepository.getTasksDue(date, authUser.id)
    if (tasks.length === 0) return []

    const dueTasks = tasks.filter((task) => isTaskDue(task, date))

    return dueTasks
  })
