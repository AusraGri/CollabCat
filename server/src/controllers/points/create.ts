import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import { pointsRepository } from "@server/repositories/pointsRepository";
import provideRepos from "@server/trpc/provideRepos";
import { createPointsSchema } from "@server/entities/points";


export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))

  .input(createPointsSchema)
  .mutation(async ({ input: pointsData, ctx: { repos } }) => {
    const points = {
      ...pointsData,
    }

    const pointsCreated = await repos.pointsRepository.createPoints(points)

    return pointsCreated
  })