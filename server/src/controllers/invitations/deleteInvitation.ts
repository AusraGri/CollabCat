import { invitationsRepository } from '@server/repositories/invitationRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { messageOutputSchema } from '@server/entities/shared'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ invitationsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/invitations/delete',
      tags: ['invitations'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Delete invitation, by invitation token',
      example: {
        request: {
          invitationToken: 'someInvitationToken'
        },
      },
    },
  })
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
