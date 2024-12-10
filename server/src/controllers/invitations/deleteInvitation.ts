import { invitationsRepository } from '@server/repositories/invitationRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'

export default authenticatedProcedure
  .use(provideRepos({ invitationsRepository }))
  .input(z.object({
    invitationToken: z.string()
  }))
  .mutation(async ({ input: {invitationToken}, ctx: { repos } }) => {
     await repos.invitationsRepository.deleteInvitation(invitationToken)

    return true
  })
