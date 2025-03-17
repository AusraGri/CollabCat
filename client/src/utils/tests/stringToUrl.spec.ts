import { describe, it, expect } from 'vitest'
import { stringToUrl } from '../helpers'

describe('stringToUrl', () => {
  it('should replace spaces with hyphens', () => {
    expect(stringToUrl('Hello World')).toBe('Hello-World')
    expect(stringToUrl('  multiple   spaces ')).toBe('multiple-spaces')
  })

  it('should keep uppercase and lowercase letters', () => {
    expect(stringToUrl('TestString')).toBe('TestString')
    expect(stringToUrl('UPPER lower')).toBe('UPPER-lower')
  })

  it('should remove special characters but keep letters and numbers', () => {
    expect(stringToUrl('C++ is Great!')).toBe('C-is-Great')
    expect(stringToUrl('Hello@World.com')).toBe('HelloWorldcom')
    expect(stringToUrl('Price: $100')).toBe('Price-100')
  })

  it('should preserve non-Latin letters (e.g., accents, umlauts)', () => {
    expect(stringToUrl('Aušra BCOR')).toBe('Aušra-BCOR')
    expect(stringToUrl('Jürgen Müller')).toBe('Jürgen-Müller')
    expect(stringToUrl('Tômáš Dvořák')).toBe('Tômáš-Dvořák')
  })

  it('should handle empty strings', () => {
    expect(stringToUrl('')).toBe('')
  })

  it('should remove leading and trailing spaces', () => {
    expect(stringToUrl('   test  ')).toBe('test')
  })

  it('should remove extra hyphens and numbers', () => {
    expect(stringToUrl('2024 is here')).toBe('2024-is-here')
    expect(stringToUrl('keep-this--dash')).toBe('keep-this-dash')
  })

  it('should remove emojis and unsupported symbols', () => {
    expect(stringToUrl('Hello 😊 World')).toBe('Hello-World')
    expect(stringToUrl('Rock & Roll! 🎸')).toBe('Rock-Roll')
  })
})
