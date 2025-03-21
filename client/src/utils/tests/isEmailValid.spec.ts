import { describe, it, expect } from 'vitest'
import { isEmailValid } from '../helpers'

describe('isEmailValid', () => {
  it('should return true for valid email addresses', () => {
    expect(isEmailValid('test@example.com')).toBe(true)
    expect(isEmailValid('user.name@domain.co')).toBe(true)
    expect(isEmailValid('email@sub.domain.com')).toBe(true)
    expect(isEmailValid('1234567890@example.com')).toBe(true)
    expect(isEmailValid('email+alias@domain.com')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(isEmailValid('plainaddress')).toBe(false)
    expect(isEmailValid('missing-at.com')).toBe(false)
    expect(isEmailValid('email@.com')).toBe(false)
    expect(isEmailValid('@missingusername.com')).toBe(false)
    expect(isEmailValid('email@domain@domain.com')).toBe(false)
    expect(isEmailValid('email@domain..com')).toBe(false)
  })

  it('should return false for empty or undefined inputs', () => {
    expect(isEmailValid('')).toBe(false)
    expect(isEmailValid(' ')).toBe(false)
  })

  it('should return false for non-string values', () => {
    expect(isEmailValid(null as any)).toBe(false)
    expect(isEmailValid(undefined as any)).toBe(false)
    expect(isEmailValid(12345 as any)).toBe(false)
  })
})
