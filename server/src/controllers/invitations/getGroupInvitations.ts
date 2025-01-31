import { invitationsRepository } from '@server/repositories/invitationRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { type PublicInvitation, invitationSchema } from '@server/entities/invitations'

export default authenticatedProcedure
  .use(provideRepos({ invitationsRepository }))
  .input(z.void())
  .output(z.array(invitationSchema))
  .query(async ({ ctx: { authUser, repos } }) => {
    const invitations: PublicInvitation[] =
      await repos.invitationsRepository.getInvitationByEmail(authUser.email)

    return invitations
  })
