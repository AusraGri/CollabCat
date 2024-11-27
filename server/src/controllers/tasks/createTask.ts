import { tasksRepository } from '@server/repositories/tasksRepository'
import provideRepos from '@server/trpc/provideRepos'
import { inputTaskSchema, taskSchemaOutput } from '@server/entities/tasks'
import { TRPCError } from '@trpc/server'
import { publicProcedure } from '../../trpc/index'

export const createTaskProcedure = publicProcedure
  .use(provideRepos({ tasksRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/tasks/creates',
      tags: ['tasks'],
      summary: 'Create a new task',
      protect: true,
      example: {
        request: {
          title: 'New Task',
          startDate: '2024-11-11',
        },
      },
    },
  })
  .input(inputTaskSchema)
  .output(taskSchemaOutput)
  .mutation(async ({ input: taskData, ctx }) => {
    // Validate required context
    if (!ctx.authUser) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User must be authenticated.',
      })
    }

    const newTaskData = { ...taskData }

    if (ctx.userGroup) {
    // TO DO: check permission and add user group id to the task

    newTaskData.groupId = ctx.userGroup.groupId
    }

    const task = {
      ...newTaskData,
      createdByUserId: ctx.authUser.id,
    }

    const taskCreated = await ctx.repos.tasksRepository.create(task)

    return taskCreated
  })
