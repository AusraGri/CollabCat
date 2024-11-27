import { promisify } from 'util'
import config from '@server/config'
import jsonwebtoken from 'jsonwebtoken'
import { TRPCError } from '@trpc/server'
import jwksClient from 'jwks-rsa'
import { userRepository } from '@server/repositories/userRepository'
import { publicProcedure } from '..'
import provideRepos from '../provideRepos'

interface Auth0TokenPayload {
  sub: string
  email: string
  name?: string
  picture?: string
}

const client = jwksClient({
  jwksUri: `https://${config.auth0.issuerBaseURL}/.well-known/jwks.json`, // Replace with your Auth0 JWKS URI
})

// Promisify the `getSigningKey` function
const getSigningKey = promisify(client.getSigningKey)

export async function verifyAuth0Token(
  token: string,
  audience: string,
  issuer: string
): Promise<Auth0TokenPayload> {
  // Fetch the signing key dynamically
  const decodedHeader = jsonwebtoken.decode(token, {
    complete: true,
  }) as { header: jsonwebtoken.JwtHeader } | null

  if (!decodedHeader || !decodedHeader.header.kid) {
    throw new Error('Invalid token in the header')
  }

  const key = await getSigningKey(decodedHeader.header.kid)

  if (!key) {
    throw new Error('Signing key not found')
  }

  const publicKey = key.getPublicKey()

  // Verify the token
  const decoded = jsonwebtoken.verify(token, publicKey, {
    audience,
    issuer,
    algorithms: ['RS256'], // Auth0 uses RS256 for signing tokens
  }) as Auth0TokenPayload
  return decoded // Return the decoded token payload
}

export const authenticatedProcedure = publicProcedure
  .use(
    provideRepos({
      userRepository,
    })
  )
  .use(async ({ ctx, next }) => {
    if (ctx.authUser) {
      return next({
        ctx: {
          authUser: ctx.authUser,
        },
      })
    }

    if (!ctx.req) {
      const message =
        config.env === 'development' || config.env === 'test'
          ? 'Missing Express request object. If you are running tests, make sure to provide some req object in the procedure context.'
          : 'Missing Express request object.'

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message,
      })
    }

    if (!ctx.req.auth || !ctx.req.auth.payload) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Token is not validated',
      })
    }

    const { token } = ctx.req.auth
    const { sub } = ctx.req.auth.payload

    if (!token || !sub) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthenticated. Please log in.',
      })
    }

    const user = await ctx.repos.userRepository.findByAuth0Id(sub)

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token here.',
      })
    }

    return next({
      ctx: {
        authUser: { id: user.id },
      },
    })
  })
