import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { idSchema } from '@server/entities/shared'
import { userPublicSchema } from '@server/entities/user'

export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(
    z.object({
      userId: idSchema,
    })
  )
  .output(userPublicSchema.or(z.undefined()))
  .query(async ({ input: { userId }, ctx: { repos } }) => {
    const user = await repos.userRepository.findById(userId)

    return user
  })
