import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { dateSchema } from '@server/entities/shared'
import isTaskDue from '@server/utils/isTaskDue'
import { taskDataSchema, type TaskData } from '@server/entities/tasks'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { setDateToUTCmidnight } from '../utility/helpers'

export default groupAuthProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/tasks/groupDaily',
      tags: ['tasks'],
      summary: 'Get tasks for the given date for group',
      protect: true,
      example: {
        request: {
          date: '2024-11-11',
          groupId: 1
        },
      },
    },
  })
  .input(z.object({ date: dateSchema }))
  .output(taskDataSchema.array())
  .query(async ({ input: { date }, ctx: { authUser, userGroup, repos } }) => {
    if (!userGroup) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not authorized in the group',
      })
    }

     const dateUTC = setDateToUTCmidnight(date)

    const tasks: TaskData[] = await repos.tasksRepository.getGroupTasksDue({
      date: dateUTC,
      userId: authUser.id,
      groupId: userGroup?.groupId,
    })

    if (tasks.length === 0) return []

    const dueTasks: TaskData[] = tasks.filter((task: TaskData) => isTaskDue(task, date))

    return dueTasks
  })
