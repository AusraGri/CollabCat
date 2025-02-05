import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { userRepository } from '@server/repositories/userRepository'
import z from 'zod'
import { messageOutputSchema } from '@server/entities/shared'
import { outputMessageForDelete } from '../utility/helpers'

export default authenticatedProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .input(z.void())
  .output(messageOutputSchema)
  .mutation(async ({ ctx: { repos, authUser } }) => {
    const deletedUser = await repos.userRepository.deleteUser(authUser.id)

    const message = outputMessageForDelete({
      objective: 'User',
      conditional: !!deletedUser.numDeletedRows,
    })

    return message
  })
