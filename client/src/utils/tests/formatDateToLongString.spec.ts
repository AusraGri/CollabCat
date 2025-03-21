import { describe, it, expect } from 'vitest'
import { formatDateToLongString } from '../helpers'

describe('formatDateToLongString', () => {
  it('should correctly format a date into "YYYY Month Day, Weekday" format', () => {
    const date = new Date('2025-03-17T12:00:00Z')
    expect(formatDateToLongString(date)).toBe('2025 March 17, Monday')
  })

  it('should handle a date in local time zone correctly', () => {
    const date = new Date('2025-02-18T08:00:00+02:00')
    expect(formatDateToLongString(date)).toBe('2025 February 18, Tuesday')
  })

  it('should format correctly for a date with a weekend day', () => {
    const date = new Date('2025-03-22T12:00:00Z')
    expect(formatDateToLongString(date)).toBe('2025 March 22, Saturday')
  })

  it('should format correctly for a leap year date', () => {
    const date = new Date('2024-02-29T00:00:00Z')
    expect(formatDateToLongString(date)).toBe('2024 February 29, Thursday')
  })

  it('should return correct output even for a date with a single-digit day or month', () => {
    const date = new Date('2025-09-05T12:00:00Z')
    expect(formatDateToLongString(date)).toBe('2025 September 5, Friday')
  })

  it('should handle the first day of the year correctly', () => {
    const date = new Date('2025-01-01T00:00:00Z')
    expect(formatDateToLongString(date)).toBe('2025 January 1, Wednesday')
  })

  it('should handle dates in UTC correctly', () => {
    const date = new Date('2025-03-17T12:00:00Z')
    expect(formatDateToLongString(date)).toBe('2025 March 17, Monday')
  })

  it('should handle a date with time in the evening correctly', () => {
    const date = new Date('2025-03-17T18:00:00Z')
    expect(formatDateToLongString(date)).toBe('2025 March 17, Monday')
  })
})
