import jwt from 'jsonwebtoken'
import {
  validateAndDecodeJWT,
  type DecodedToken,
} from '../utils/tokenValidation'

vi.mock('jsonwebtoken')

vi.mock('@server/config', () => ({
  default: { auth: { tokenKey: 'test_secret_key' } },
}))

const SECRET_KEY = 'test_secret_key'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('validateAndDecodeJWT', () => {
  it('should return decoded token for a valid JWT', () => {
    const mockDecodedToken: DecodedToken = {
      user: { email: 'test@example.com' },
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600,
    }

    vi.spyOn(jwt, 'verify').mockImplementation(() => mockDecodedToken)

    const token = 'valid.jwt.token'
    const result = validateAndDecodeJWT(token)

    expect(result).toEqual(mockDecodedToken)
    expect(jwt.verify).toHaveBeenCalledWith(token, SECRET_KEY)
  })

  it('should throw an error for an invalid JWT', () => {
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token')
    })

    const token = 'invalid.jwt.token'
    expect(() => validateAndDecodeJWT(token)).toThrow(
      'Invalid or expired token'
    )
  })
})
