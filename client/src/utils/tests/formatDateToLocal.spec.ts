import { describe, it, expect } from 'vitest'
import { formatDateToLocal } from '../helpers'

describe('formatDateToLocal', () => {
  it('should correctly format a date to YYYY-MM-DD', () => {
    const date = new Date('2025-03-17T12:00:00Z')
    expect(formatDateToLocal(date)).toBe('2025-03-17')
  })

  it('should handle a date in local time zone correctly', () => {
    const date = new Date('2025-02-18T08:00:00+02:00')
    expect(formatDateToLocal(date)).toBe('2025-02-18')
  })

  it('should return correct date for dates without time part', () => {
    const date = new Date('2025-03-17')
    expect(formatDateToLocal(date)).toBe('2025-03-17')
  })

  it('should handle edge case with a leap year date', () => {
    const date = new Date('2024-02-29T00:00:00Z')
    expect(formatDateToLocal(date)).toBe('2024-02-29')
  })

  it('should handle dates with different times correctly', () => {
    const date1 = new Date('2025-03-17T15:30:00Z')
    expect(formatDateToLocal(date1)).toBe('2025-03-17')

    const date2 = new Date('2025-03-17T23:59:59Z')
    expect(formatDateToLocal(date2)).toBe('2025-03-17')
  })

  it('should handle dates with UTC time zone correctly', () => {
    const date = new Date('2025-03-17T12:00:00Z')
    expect(formatDateToLocal(date)).toBe('2025-03-17')
  })
})
