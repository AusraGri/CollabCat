import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'



export default publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(z.void()
  )
  .query(async ({ ctx: { repos } }) => {
    const user = await repos.userRepository.getAll()

    return user
  })
