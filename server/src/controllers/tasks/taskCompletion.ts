import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/indexOld'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { taskCompletionSchema } from '@server/entities/tasks'
import { TRPCError } from '@trpc/server'
import z from 'zod'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/tasks/complete',
      tags: ['tasks'],
      summary: 'Alter task completion: done/undone',
      protect: true,
    },
  })
  .input(taskCompletionSchema)
  .output(z.boolean())
  .mutation(async ({ input: taskData, ctx: { repos } }) => {
    const [isTask] = await repos.tasksRepository.getTasks({ id: taskData.id })

    if (!isTask) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task was not found',
      })
    }

    let taskCompletion

    if (taskData.isCompleted === true) {
      taskCompletion = await repos.tasksRepository.addToCompletedTasks({
        taskId: taskData.id,
        instanceDate: taskData.instanceDate,
      })
    }

    if (taskData.isCompleted === false) {
      taskCompletion = await repos.tasksRepository.removeCompletedTasks({
        taskId: taskData.id,
        instanceDate: taskData.instanceDate,
      })
    }

    if (!taskCompletion) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task was not found',
      })
    }

    return !!taskCompletion
  })
