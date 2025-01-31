import { invitationsRepository } from '@server/repositories/invitationRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { deleteOutputSchema } from '@server/entities/shared'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'

export default authenticatedProcedure
  .use(provideRepos({ invitationsRepository }))
  .input(
    z.object({
      invitationToken: z.string(),
    })
  )
  .output(deleteOutputSchema)
  .mutation(async ({ input: { invitationToken }, ctx: { repos } }) => {
    const result = await repos.invitationsRepository.deleteInvitation(invitationToken)

    return {
      success: true,
      message: result?.numDeletedRows === 0n
        ? "Invitation was not found (possibly already deleted)."
        : "Invitation successfully deleted."
    };
  })
