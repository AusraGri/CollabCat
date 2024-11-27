import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .query(async () => {

    const tasks = ['task', 'task1']

    if (!tasks?.length) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tasks were not found',
      })
    }

    return tasks
  })
