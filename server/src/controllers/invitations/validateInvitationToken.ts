import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import z from 'zod'
import { TRPCError } from '@trpc/server'
import { invitationSchema } from '@server/entities/invitations'
import { invitationsRepository } from '../../repositories/invitationRepository'
import { validateAndDecodeJWT } from './utils/tokenValidation'

export default publicProcedure
  .use(provideRepos({ invitationsRepository }))
  .input(
    z.object({
      invitationToken: z.string(),
    })
  )
  .output(
    z.object({
      decoded: z.object({
        user: z.object({
          email: z.string().email(),
        }),
        iat: z.number(),
        exp: z.number(),
      }),
      invitation: invitationSchema,
    })
  )
  .query(async ({ input: { invitationToken }, ctx: { repos } }) => {
    const invitation =
    await repos.invitationsRepository.getInvitationByToken(invitationToken)
    
    if (!invitation) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message:
          'Unauthorized. User does not have permission to join the group',
      })
    }

    const decoded = validateAndDecodeJWT(invitationToken)

    const invitationData = {
      decoded,
      invitation,
    }

    return invitationData
  })
