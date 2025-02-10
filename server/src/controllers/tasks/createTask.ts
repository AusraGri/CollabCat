import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { recurringPatternSchemaInput } from '@server/entities/recurrence'
import { inputTaskSchema, taskDataSchema } from '@server/entities/tasks'
import z from 'zod'
// import { setDateToUTCmidnight } from '../utility/helpers'

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/tasks/createTask',
      tags: ['tasks'],
      summary: 'Create new task',
      protect: true,
      example: {
        request: {
          title: 'New Task',
          startDate: '2024-11-11',
        },
      },
    },
  })
  .input(
    z.object({
      task: inputTaskSchema,
      recurrence: recurringPatternSchemaInput.optional(),
    })
  )
  .output(taskDataSchema)
  .mutation(async ({ input: taskData, ctx: { authUser, repos } }) => {
    const task = {
      ...taskData.task,
      createdByUserId: authUser.id,
    }
    const newTaskData = {
      task,
      recurrence: taskData.recurrence,
    }

    const taskCreated = await repos.tasksRepository.createTask(newTaskData)

    return taskCreated
  })
