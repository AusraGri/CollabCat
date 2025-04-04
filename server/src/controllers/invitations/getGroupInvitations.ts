import { invitationsRepository } from '@server/repositories/invitationRepository'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import {
  type PublicInvitation,
  invitationSchema,
} from '@server/entities/invitations'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ invitationsRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/invitations/get',
      tags: ['invitations'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get user invitations to join the group',
    },
  })
  .input(z.void())
  .output(z.array(invitationSchema))
  .query(async ({ ctx: { authUser, repos } }) => {
    const invitations: PublicInvitation[] =
      await repos.invitationsRepository.getInvitationByEmail(authUser.email)

    return invitations
  })
