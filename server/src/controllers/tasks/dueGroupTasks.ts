import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { dateSchema, idSchema } from '@server/entities/shared'
import isTaskDue from '@server/utils/isTaskDue'
import { taskDataSchema, type TaskData } from '@server/entities/tasks'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default groupAuthProcedure
  .use(provideRepos({ tasksRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/tasks/dueGroup',
      tags: ['tasks'],
      summary: 'Get tasks for the given date for group',
      protect: true,
      example: {
        request: {
          date: '2024-11-11',
          groupId: 1,
        },
      },
    },
  })
  .input(
    z.object({
      date: dateSchema,
      userId: idSchema.optional(),
    })
  )
  .output(taskDataSchema.array())
  .query(async ({ input: { date, userId }, ctx: { userGroup, repos } }) => {
    const tasks: TaskData[] = await repos.tasksRepository.getGroupTasksDue({
      date,
      userId,
      groupId: userGroup.groupId,
    })

    if (tasks.length === 0) return []

    const dueTasks: TaskData[] = tasks.filter((task: TaskData) =>
      isTaskDue(task, date)
    )

    return dueTasks
  })
