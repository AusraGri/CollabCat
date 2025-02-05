import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { userPublicSchema } from '@server/entities/user'

export default authenticatedProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(z.void())
  .output(userPublicSchema.or(z.void()))
  .query(async ({ ctx: { repos, authUser } }) => {
    const user = await repos.userRepository.findById(authUser.id)

    return user
  })
