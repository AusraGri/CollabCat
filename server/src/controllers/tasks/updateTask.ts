import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import { tasksRepository } from "@server/repositories/tasksRepository";
import provideRepos from "@server/trpc/provideRepos";
import { taskUpdateSchema } from "@server/entities/tasks";
import { TRPCError } from '@trpc/server'


export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))

  .input(taskUpdateSchema)
  .mutation(async ({ input: taskData, ctx: { repos } }) => {

    const updatedTask = await repos.tasksRepository.update(taskData)

    if (!updatedTask) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Failed to update the task',
        })
      }

    return updatedTask
  })
