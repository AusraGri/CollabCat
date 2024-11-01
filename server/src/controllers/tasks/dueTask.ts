import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .input(z.date())
  .query(async ({ input: date, ctx: { authUser, repos } }) => {
    // should check and return tasks for that date
  })
