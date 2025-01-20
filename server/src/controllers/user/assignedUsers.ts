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
  .input(z.number()
  )
  .query(async ({ input, ctx: { repos } }) => {
    const users = await repos.userRepository.findAssignedUsersByTaskId(input)

    return users
  })
