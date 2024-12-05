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
  .input(z.object({
    username: z.string().min(1).max(15).optional(),
    picture: z.string().optional()
  })
  )
  .mutation(async ({  input: userData, ctx: { repos, authUser } }) => {
    const user = await repos.userRepository.findById(authUser.id)

    if(!user){
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authorized',
          })
    }

    let updatedPicture : string | undefined
    let updatedUser

    if(!userData.username) return user

    if(!user.provider.includes("google")){
      const encodedUsername = encodeURIComponent(userData.username).replace(/%20/g, "+");
       updatedPicture = `https://ui-avatars.com/api/?name=${encodedUsername}&size=128&background=random`
       updatedUser = await repos.userRepository.update(authUser.id, {...userData, picture: updatedPicture})

       return updatedUser
    }

    updatedUser = await repos.userRepository.update(authUser.id, {username: userData.username})

    return updatedUser
  })