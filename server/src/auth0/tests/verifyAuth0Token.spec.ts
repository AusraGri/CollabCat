import { describe, it, expect, vi, beforeEach } from 'vitest'
import jsonwebtoken, { JsonWebTokenError } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { verifyAuth0Token } from '../verifyAuth0Token'

vi.mock('util', () => ({
  promisify: vi.fn(() =>
    vi.fn(() =>
      Promise.resolve({
        getPublicKey: () => 'mock-public-key',
      })
    )
  ),
}))

vi.mock('jsonwebtoken', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('jsonwebtoken')
  return {
    ...actual,
    default: {
      decode: vi.fn(),
      verify: vi.fn(),
    },
  }
})

vi.mock('jwks-rsa', () => ({
  default: vi.fn(() => ({
    getSigningKey: vi.fn((kid, callback) => {
      callback(null, {
        getPublicKey: () => 'mock-public-key',
      })
    }),
  })),
}))

describe('verifyAuth0Token', () => {
  const mockToken = 'mock.jwt.token'
  const mockAudience = 'test-audience'
  const mockIssuer = 'test-issuer'
  const mockPublicKey = 'mock-public-key'
  const mockPayload = { sub: 'user123', exp: Date.now() / 1000 + 3600 } // Token valid for 1 hour

  let getSigningKeyMock: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should verify a valid token and return the payload', async () => {
    ;(jsonwebtoken.decode as any).mockReturnValue({
      header: { kid: 'test-kid' },
    })
    ;(jsonwebtoken.verify as any).mockReturnValue(mockPayload)

    getSigningKeyMock = vi.fn().mockResolvedValue({
      getPublicKey: () => mockPublicKey,
    })
    ;(jwksClient as any).mockReturnValue({ getSigningKey: getSigningKeyMock })

    const result = await verifyAuth0Token(mockToken, mockAudience, mockIssuer)

    expect(result).toEqual({ sub: 'user123', exp: expect.any(Number) })
  })

  it.skip('should throw an error if the token is expired', async () => {
    ;(jsonwebtoken.verify as any).mockImplementation(() => {
      throw new Error('expired')
    })

    await expect(
      verifyAuth0Token(mockToken, mockAudience, mockIssuer)
    ).rejects.toThrow('expired')
  })

  it.skip('should throw an error if the token is invalid', async () => {
    ;(jsonwebtoken.verify as any).mockImplementation(() => {
      throw new JsonWebTokenError('token error')
    })

    await expect(
      verifyAuth0Token(mockToken, mockAudience, mockIssuer)
    ).rejects.toThrow('Invalid token')
  })

  it.skip('should throw an error if the signing key is not found', async () => {
    await expect(
      verifyAuth0Token(mockToken, mockAudience, mockIssuer)
    ).rejects.toThrow('Signing key not found')
  })

  it('should throw an error if the token has no kid in the header', async () => {
    ;(jsonwebtoken.decode as any).mockReturnValue({ header: {} })

    await expect(
      verifyAuth0Token(mockToken, mockAudience, mockIssuer)
    ).rejects.toThrow('Invalid token in the header')
  })
})
