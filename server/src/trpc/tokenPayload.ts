import {
  authUserEmail,
  authUserSchema,
  type AuthUser,
  type AuthUserEmail,
} from '@server/entities/user'
import { z } from 'zod'

// We have move out the token payload logic into a separate file.
// As we would like to keep both sides of token handling in one place.

const tokenPayloadSchema = z.object({
  user: authUserSchema,
})

const tokenInvitationPayloadSchema = z.object({
  user: authUserEmail,
})

type TokenPayload = z.infer<typeof tokenPayloadSchema>

type TokenInvitationPayload = z.infer<typeof tokenInvitationPayloadSchema>

/**
 * Prepares the token payload for the given user.
 * @param user The authenticated user.
 * @returns The token payload containing the user information.
 */
export function prepareTokenPayload(user: AuthUser): TokenPayload {
  return tokenPayloadSchema.parse({ user })
}

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

/**
 * Parses the payload of a verified JWT token.
 * @param tokenVerified - The verified JWT token.
 * @returns The parsed token payload.
 */
export function parseTokenPayload(tokenVerified: unknown): TokenPayload {
  return tokenPayloadSchema.parse(tokenVerified)
}
