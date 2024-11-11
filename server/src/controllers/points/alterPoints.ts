import { authenticatedProcedure } from "@server/trpc/authenticatedProcedure";
import { pointsRepository } from "@server/repositories/pointsRepository";
import provideRepos from "@server/trpc/provideRepos";
import { alterPointsSchema } from "@server/entities/points";


export default authenticatedProcedure
  .use(provideRepos({ pointsRepository }))

  .input(alterPointsSchema)
  .mutation(async ({ input: pointsData, ctx: { repos } }) => {
    const points = {
      ...pointsData,
    }

    const updatedPoints = await repos.pointsRepository.alterPoints(points)

    return updatedPoints
  })