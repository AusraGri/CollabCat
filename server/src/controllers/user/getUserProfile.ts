import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { TRPCError } from '@trpc/server'


export default authenticatedProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(z.void()
  )
  .query(async ({ ctx: { repos, authUser } }) => {
    const user = await repos.userRepository.findById(authUser.id)

    if(!user){
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authorized',
          })
    }

    return user
  })