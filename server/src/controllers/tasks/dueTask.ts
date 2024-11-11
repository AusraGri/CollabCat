import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { dateSchema } from '@server/entities/shared'
import isTaskDue from '@server/utils/isTaskDue'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({description: 'Returns tasks for the given date'})
  .input(z.object({date: dateSchema}))
  .query(async ({ input: {date}, ctx: { authUser, repos } }) => {
    // should check and return tasks for that date for the user

    const tasks = await repos.tasksRepository.getTasksDue(date, authUser.id)

    if (tasks.length === 0) return []

    const dueTasks = tasks.filter((task) => isTaskDue(task, date))

    return dueTasks
  })
