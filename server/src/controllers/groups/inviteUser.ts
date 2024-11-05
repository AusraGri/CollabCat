import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { sentInvitationMail } from '@server/emailer'
import jsonwebtoken from 'jsonwebtoken'
import config from '@server/config'
import { prepareInvitationTokenPayload } from '@server/trpc/tokenPayload'
import { invitationsRepository } from '../../repositories/invitationRepository'

const { expiresIn, tokenKey } = config.auth
export default groupAuthProcedure
  .use(provideRepos({ groupsRepository, invitationsRepository }))

  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .mutation(async ({ input: { email }, ctx: { userGroup, repos } }) => {
    if (!userGroup || userGroup.role !== 'Admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User does not have permission to invite users to this group',
      })
    }
    // check if user is not already in the group
    const usersInGroup = await repos.groupsRepository.getGroupMembers(userGroup.groupId)

    const isUserIngroup = usersInGroup.some((user) => user.email === email)

    if (isUserIngroup) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already in the group',
        })
      }
    // check if this user is not already invited
    const isUserInvited =
      await repos.invitationsRepository.getInvitationByEmail(email)

    if (isUserInvited) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User is already invited to the group',
      })
    }

    // construct invitation token
    const payload = prepareInvitationTokenPayload({ email })

    const inviteToken = jsonwebtoken.sign(payload, tokenKey, {
      expiresIn,
    })

    // sent invitation
    await sentInvitationMail({ email, inviteToken })

    // if sending invitation was successful only then save invitation to the database
    const invitation = await repos.invitationsRepository.createInvitation({
      groupId: userGroup.groupId,
      email,
      invitationToken: inviteToken,
    })

    return invitation
  })
