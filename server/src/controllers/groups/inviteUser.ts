import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { groupsRepository } from '@server/repositories/groupsRepository'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { sentInvitationMail, getMailTransporter } from '@server/emailer'
import jsonwebtoken from 'jsonwebtoken'
import config from '@server/config'
import { prepareInvitationTokenPayload } from '@server/trpc/tokenPayload'
import { invitationSchema } from '@server/entities/invitations'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'
import { userRepository } from '@server/repositories/userRepository'
import { invitationsRepository } from '../../repositories/invitationRepository'


const { expiresIn, tokenKey } = config.auth
export default groupAuthProcedure
  .use(
    provideRepos({ groupsRepository, invitationsRepository, userRepository })
  )
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'POST',
      path: '/group/inviteUser',
      tags: ['group'],
      protect: true,
      summary: 'Invite user to the group',
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      description:
        'First you need to create group to be able to invite the user',
        example: {
          request: {
            email: 'some@email.com',
          },
        },
    },
  })
  .input(
    z.object({
      email: z.string().email().describe('User email that you want to invite'),
    })
  )
  .output(invitationSchema)
  .mutation(async ({ input: { email }, ctx: { userGroup, repos } }) => {
    if (userGroup.role !== 'Admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message:
          'Unauthorized. User does not have permission to invite users to this group',
      })
    }

    const usersInGroup = await repos.groupsRepository.getGroupMembers(
      userGroup.groupId
    )

    const isUserIngroup = usersInGroup.some((user) => user.email === email)

    if (isUserIngroup) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User is already in the group',
      })
    }

    const isUserInvited =
      await repos.invitationsRepository.getInvitationByGroupAndEmail({
        email,
        groupId: userGroup.groupId,
      })

    if (isUserInvited) {
      const existingToken = isUserInvited.invitationToken

      await repos.invitationsRepository.deleteInvitation(existingToken)
    }

    const userHasAccount = await repos.userRepository.findByEmail(email)

    const payload = prepareInvitationTokenPayload({ email })

    const inviteToken = jsonwebtoken.sign(payload, tokenKey, {
      expiresIn,
    })

    const mailTransporter = getMailTransporter()

    if (!userHasAccount) {
      await sentInvitationMail(mailTransporter, { email, inviteToken })
    }

    const invitation = await repos.invitationsRepository.createInvitation({
      groupId: userGroup.groupId,
      email,
      invitationToken: inviteToken,
    })

    return invitation
  })
