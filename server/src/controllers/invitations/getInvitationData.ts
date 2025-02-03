import { invitationsRepository } from '@server/repositories/invitationRepository'
import { groupsRepository } from '@server/repositories/groupsRepository'
import { userRepository } from '@server/repositories/userRepository'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import {
  type InvitationData,
  invitationDataSchema,
} from '../../entities/invitations'

export default authenticatedProcedure
  .use(
    provideRepos({ invitationsRepository, groupsRepository, userRepository })
  )
  .input(
    z.object({
      invitationToken: z.string(),
    })
  )
  .output(invitationDataSchema)
  .query(async ({ input: { invitationToken }, ctx: { repos } }) => {
    const invitation =
      await repos.invitationsRepository.getInvitationByToken(invitationToken)

    if (!invitation) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invitation not found',
      })
    }

    const [group] = await repos.groupsRepository.getGroup({
      id: invitation.groupId,
    })

    const user = group
      ? await repos.userRepository.findById(group.createdByUserId)
      : null

    if (!group || !user) {
      await repos.invitationsRepository.deleteInvitation(invitationToken)

      throw new TRPCError({
        code: 'NOT_FOUND',
        message:
          'Invitation is no longer valid: group or inviter not found. Invitation deleted.',
      })
    }

    const userData = {
      username: user.username,
      email: user.email,
      picture: user.picture,
      id: user.id,
    }

    const invitationCredentials: InvitationData = {
      invitation,
      groupName: group.name,
      groupOwner: userData,
    }

    return invitationCredentials
  })
