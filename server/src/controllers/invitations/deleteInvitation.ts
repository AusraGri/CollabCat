import { invitationsRepository } from '@server/repositories/invitationRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { messageOutputSchema } from '@server/entities/shared'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'

export default authenticatedProcedure
  .use(provideRepos({ invitationsRepository }))
  .input(
    z.object({
      invitationToken: z.string(),
    })
  )
  .output(messageOutputSchema)
  .mutation(async ({ input: { invitationToken }, ctx: { repos } }) => {
    const result =
      await repos.invitationsRepository.deleteInvitation(invitationToken)

    return {
      success: true,
      message: result?.numDeletedRows
        ? 'Invitation successfully deleted.'
        : 'Invitation was not found (possibly already deleted).',
    }
  })
