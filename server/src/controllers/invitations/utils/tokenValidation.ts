import jwt from 'jsonwebtoken'
import config from '@server/config'

export interface DecodedToken {
  user: {
    email: string
  }
  iat: number
  exp: number
}

const SECRET_KEY = config.auth.tokenKey

/**
 * Validates and decodes an invitation JWT.
 * @param token - The JWT to validate.
 * @returns The decoded token if valid, or throws an error if invalid.
 */
export function validateAndDecodeJWT(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken

    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}
