import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { taskCompletionSchema} from '@server/entities/tasks'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { setDateToUTCmidnight } from '../utility/helpers'

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
  .mutation(async ({ input: taskData, ctx: { authUser, repos } }) => {
    console.log('TASK DATA RECEIVED', taskData)
    const [isTask] = await repos.tasksRepository.getTasks({ id: taskData.id })
    console.log('TASK FOUND BY ID', isTask)
    
    if (!isTask) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Task was not found',
      })
    }
    
    const isTaskRecurring = isTask.isRecurring ? isTask.isRecurring : false

    const instanceDate = setDateToUTCmidnight(taskData.instanceDate)

    if (isTaskRecurring) {
      if (taskData.isCompleted === true) {
       await repos.tasksRepository.addToCompletedTasks({
          taskId: taskData.id,
          instanceDate,
          completedBy: authUser.id,
        })

        return true
      }

      if (taskData.isCompleted === false) {
        const taskCompletion = await repos.tasksRepository.removeCompletedTasks({
          taskId: taskData.id,
          instanceDate
        })

        return !!taskCompletion.numDeletedRows
      }
    }

    if (isTask.isCompleted === taskData.isCompleted) return true

    await repos.tasksRepository.updateTaskCompletion({
      id: taskData.id,
      isCompleted: taskData.isCompleted,
    })

    return true
  })
