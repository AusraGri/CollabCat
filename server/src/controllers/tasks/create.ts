import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import { tasksRepository } from "@server/repositories/tasksRepository";
import provideRepos from "@server/trpc/provideRepos";
import { inputTaskSchema} from "@server/entities/tasks";

export default authenticatedProcedure
  .use(provideRepos({ tasksRepository }))
  .input(inputTaskSchema)
  .mutation(async ({ input: taskData, ctx: { authUser, repos } }) => {
    const task = {
      ...taskData,
      createdByUserId: authUser.id,
    }

    const taskCreated = await repos.tasksRepository.create(task)

    return taskCreated
  })
