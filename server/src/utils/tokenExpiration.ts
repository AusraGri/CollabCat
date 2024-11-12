import jsonwebtoken, { type JwtPayload } from 'jsonwebtoken'
import config from '@server/config'

const { tokenKey } = config.auth

export function verifyToken(token: string) {
  let tokenExpiresAt
  try {
    jsonwebtoken.verify(token, tokenKey)
    const tokenData = jsonwebtoken.decode(token) as JwtPayload
    if (tokenData && typeof tokenData === 'object' && 'exp' in tokenData) {
      tokenExpiresAt = new Date(tokenData.exp! * 1000)
    }
    return tokenExpiresAt
  } catch (error) {
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      throw new Error('Token has expired')
    } else if (error instanceof jsonwebtoken.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    throw new Error('Failed to validate the token')
  }
}
