import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { idSchema } from '@server/entities/shared'

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(z.object({
    userId: idSchema
  })
  )
  .query(async ({ input: {userId}, ctx: { repos } }) => {
    const user = await repos.userRepository.findById(userId)

    return user
  })
