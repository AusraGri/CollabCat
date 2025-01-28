import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { taskUpdateSchema, taskDataSchema } from '@server/entities/tasks'
import { setDateToUTCmidnight } from '../utility/helpers'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/tasks/update',
      tags: ['tasks'],
      summary: 'Update task and its recurrence',
      protect: true,
      example: {
        request: {
          id: 1,
          task: {
            title: 'Updated Title',
          },
        },
      },
    },
  })
  .input(taskUpdateSchema)
  .output(taskDataSchema)
  .mutation(async ({ input: taskData, ctx: { repos } }) => {
    const { startDate, endDate } = taskData.task

    const task = {
      ...taskData.task,
      startDate: startDate ? setDateToUTCmidnight(startDate) : undefined,
      endDate: endDate ? setDateToUTCmidnight(endDate) : undefined,
    }

    await repos.tasksRepository.updateTask({ ...taskData, task })

    const [updatedTask] = await repos.tasksRepository.getTasks({
      id: taskData.id,
    })

    return updatedTask
  })
