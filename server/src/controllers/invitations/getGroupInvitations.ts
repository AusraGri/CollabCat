import { invitationsRepository } from '@server/repositories/invitationRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import type { PublicInvitation } from '@server/entities/invitations'

export default authenticatedProcedure
  .use(provideRepos({ invitationsRepository }))
  .input(z.void())
  .query(async ({ ctx: { authUser, repos } }) => {
    console.log('getting invitations for.......', authUser)
    const invitations : PublicInvitation []= await repos.invitationsRepository.getInvitationByEmail(
      authUser.email
    )
    console.log('invitations', invitations)

    return invitations 
  })
