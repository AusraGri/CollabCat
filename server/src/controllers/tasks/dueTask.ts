import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import isTaskDue from '@server/utils/isTaskDue'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .input(z.date())
  .query(async ({ input: date, ctx: { authUser, repos } }) => {
    // should check and return tasks for that date for the user

    const tasks = await repos.tasksRepository.getTasksDue(date, authUser.id)

    if (tasks.length === 0) return []

    const dueTasks = tasks.filter((task) => isTaskDue(task, date))

    return dueTasks
  })
