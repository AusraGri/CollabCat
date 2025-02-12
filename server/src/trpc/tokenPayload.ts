import { authUserEmail, type AuthUserEmail } from '@server/entities/user'
import { z } from 'zod'

const tokenInvitationPayloadSchema = z.object({
  user: authUserEmail,
})

type TokenInvitationPayload = z.infer<typeof tokenInvitationPayloadSchema>

/**
 * Prepares the token payload for the given user.
 * @param userEmail The user email.
 * @returns The token payload containing the user information.
 */

export function prepareInvitationTokenPayload(
  user: AuthUserEmail
): TokenInvitationPayload {
  return tokenInvitationPayloadSchema.parse({ user })
}
