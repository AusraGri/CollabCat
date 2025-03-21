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
  .input(
    z.object({
      username: z.string().trim().min(1).max(20),
    })
  )
  .mutation(async ({ input: userData, ctx: { repos, authUser } }) => {
    const user = await repos.userRepository.findById(authUser.id)

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authorized',
      })
    }

    const encodedUsername = encodeURIComponent(userData.username).replace(
      /%20/g,
      '+'
    )

    const picture = `https://ui-avatars.com/api/?name=${encodedUsername}&size=128&background=random`

    const updatedUserData = user.provider.includes('google')
      ? { ...userData }
      : { ...userData, picture }

    const updatedUser = await repos.userRepository.updateUser(
      authUser.id,
      updatedUserData
    )

    return updatedUser
  })
