import { promisify } from 'util'
import config from '@server/config'
import jsonwebtoken from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

export interface Auth0TokenPayload {
  sub: string
  email: string
  name?: string
  picture?: string
}

const client = jwksClient({
  jwksUri: `https://${config.auth0.issuerBaseURL}/.well-known/jwks.json`,
})

// Promisify the `getSigningKey` function
const getSigningKey = promisify(client.getSigningKey)

export async function verifyAuth0Token(
  token: string,
  audience: string,
  issuer: string
): Promise<Auth0TokenPayload> {
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
  try {
    const decoded = jsonwebtoken.verify(token, publicKey, {
      audience,
      issuer,
      algorithms: ['RS256'],
    }) as Auth0TokenPayload

    return decoded
  } catch (error) {
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      throw new Error('Token has expired')
    } else if (error instanceof jsonwebtoken.JsonWebTokenError) {
      throw new Error('Invalid token')
    } else {
      throw new Error('Token verification failed')
    }
  }
}
