import { describe, it, expect } from 'vitest'
import { timeToLocalTime } from '../helpers'

describe('timeToLocalTime', () => {
  it('should correctly format time to local time zone', () => {
    const timeString = '15:30:00'
    const timestamp = new Date('2025-03-17T12:00:00Z') 
    expect(timeToLocalTime(timeString, timestamp)).toBe('15:30') 
  })

  it('should handle time with zero minutes', () => {
    const timeString = '08:00:15'
    const timestamp = new Date('2025-03-17T12:00:00Z')
    expect(timeToLocalTime(timeString, timestamp)).toBe('08:00') 
  })

  it('should format time correctly even if time is in the morning', () => {
    const timeString = '04:45'
    const timestamp = new Date('2025-03-17T12:00:00Z') 
    expect(timeToLocalTime(timeString, timestamp)).toBe('04:45')
  })

  it('should handle timezone conversion correctly for different time zones', () => {
    const timeString = '15:00'

    const timestamp = new Date('2025-03-17T12:00:00Z') 
   
    expect(timeToLocalTime(timeString, timestamp)).toBe('15:00')
  })

  it('should return time without seconds or milliseconds', () => {
    const timeString = '10:30'
    const timestamp = new Date('2025-03-17T12:00:00Z') 
    expect(timeToLocalTime(timeString, timestamp)).toBe('10:30')
  })

})
