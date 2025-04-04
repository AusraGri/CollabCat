import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { taskCompletionSchema } from '@server/entities/tasks'
import { TRPCError } from '@trpc/server'
import { messageOutputSchema } from '@server/entities/shared'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'POST',
      path: '/tasks/complete',
      tags: ['tasks'],
      summary: 'Alter task completion: done/undone',
      protect: true,
      example: {
        request: {
          id: 1,
          instanceDate: '2024-11-11',
          isCompleted: true
        },
      },
    },
  })
  .input(taskCompletionSchema)
  .output(messageOutputSchema)
  .mutation(async ({ input: taskData, ctx: { authUser, repos } }) => {
    const [isTask] = await repos.tasksRepository.getTasks({ id: taskData.id })

    if (!isTask) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task was not found',
      })
    }

    const isTaskRecurring = isTask.isRecurring ? isTask.isRecurring : false

    const { instanceDate, isCompleted, id } = taskData

    let isTaskCompleted = isCompleted

    if (isTaskRecurring) {
      if (isCompleted === true) {
        await repos.tasksRepository.addToCompletedTasks({
          taskId: id,
          instanceDate,
          completedBy: authUser.id,
        })

        isTaskCompleted = true
      } else if (isCompleted === false) {
        await repos.tasksRepository.removeCompletedTasks({
          taskId: id,
          instanceDate,
        })
        isTaskCompleted = false
      }
    } else if (isTask.isCompleted !== isCompleted) {
      await repos.tasksRepository.updateTaskCompletion({
        id,
        isCompleted,
      })

      isTaskCompleted = isCompleted
    }


    return {
      success: true,
      message: isTaskCompleted
        ? 'Task status: completed.'
        : 'Task status: not completed.',
    }
  })
