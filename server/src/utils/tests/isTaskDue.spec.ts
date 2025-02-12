import isTaskDue, {
  findFirstMatchingDayOccurrence,
  addOneDay,
} from '../isTaskDue'

describe('isTaskDue', () => {
  it('throws error if task has no startDate', () => {
    // Given
    const task = {}
    const date = new Date()

    // Then
    expect(() => isTaskDue(task as any, date)).toThrowError(/invalid task/i)
  })

  it('returns true if task is due on its start date', () => {
    // Given
    const task = { startDate: '2024-02-12' }
    const date = new Date('2024-02-12')
    // Then
    expect(isTaskDue(task as any, date)).toBe(true)
  })

  it('returns false if task is not due and has no recurrence', () => {
    // Given
    const task = { startDate: '2024-02-10' }
    const date = new Date('2024-02-12')
    // Then
    expect(isTaskDue(task as any, date)).toBe(false)
  })

  it('returns false if start date is later than given date', () => {
    // Given
    const task = { startDate: '2025-02-10' }
    const date = new Date('2024-02-12')
    // Then
    expect(isTaskDue(task as any, date)).toBe(false)
  })

  it('returns false if end date is later than given date', () => {
    // Given
    const task = { startDate: '2023-02-10', endDate: '2023-04-05' }
    const date = new Date('2024-02-12')
    // Then
    expect(isTaskDue(task as any, date)).toBe(false)
  })

  it('returns false if recurring type is not "daily" or "weekly"', () => {
    // Given
    const task = {
      startDate: '2023-02-10',
      recurrence: { recurringType: 'monthly' },
    }
    const date = new Date('2024-02-12')
    // Then
    expect(isTaskDue(task as any, date)).toBe(false)
  })

  it('returns true for daily recurring task', () => {
    // Given
    const task = {
      startDate: '2024-02-10',
      recurrence: { recurringType: 'daily' },
    } as any
    const date = new Date('2024-02-12')

    // Then
    expect(isTaskDue(task, date)).toBe(true)
  })

  it('returns true for daily recurrence when separation count skips a day', () => {
    // Given
    const task = {
      startDate: '2024-02-10',
      recurrence: { recurringType: 'daily', separationCount: 1 },
    } as any
    const date = new Date('2024-02-12')

    // Then
    expect(isTaskDue(task as any, date)).toBe(true)
  })

  it('returns true for weekly recurring task on correct day', () => {
    // Given
    const task = {
      startDate: '2024-02-05',
      recurrence: { recurringType: 'weekly', separationCount: 0 },
    } as any

    const date = new Date('2024-02-12')

    // Then
    expect(isTaskDue(task, date)).toBe(true)
  })

  it('returns false for weekly recurrence if not on correct day', () => {
    // Given
    const task = {
      startDate: '2024-02-05',
      recurrence: { recurringType: 'weekly', separationCount: 0 },
    } as any
    const date = new Date('2024-02-13')

    // Then
    expect(isTaskDue(task, date)).toBe(false)
  })

  it('returns true for weekly recurrence with specified days', () => {
    // Given
    const task = {
      startDate: '2024-02-05',
      recurrence: {
        recurringType: 'weekly',
        separationCount: 0,
        dayOfWeek: [1, 3],
      },
    } as any
    const date = new Date('2024-02-12')

    // Then
    expect(isTaskDue(task, date)).toBe(true)
  })

  it('throws error on invalid input', () => {
    // Given
    const invalidTask = 'cat'
    const date = new Date()

    // Then
    // @ts-expect-error
    expect(() => isTaskDue(invalidTask, date)).toThrowError(
      /task must be a non-null object/i
    )
  })

  it('throws error on invalid date input', () => {
    // Given
    const invalidTask = { startDate: new Date() }
    const date = new Date().toISOString()

    // Then
    // @ts-expect-error
    expect(() => isTaskDue(invalidTask, date)).toThrowError(
      /date must be a valid Date object/i
    )
  })
})

describe('findFirstMatchingDayOccurrence', () => {
  it('should return the start date if the days match', () => {
    // Given
    const startDate = new Date('2024-02-12')
    const givenDate = new Date('2024-02-12')
    // When
    const result = findFirstMatchingDayOccurrence(startDate, givenDate)
    // Then
    expect(result).toEqual(startDate)
  })

  it('should return the next matching day if the start date and given date do not match', () => {
    // Given
    const startDate = new Date('2024-02-12')
    const givenDate = new Date('2024-02-14')

    // When
    const result = findFirstMatchingDayOccurrence(startDate, givenDate)

    // Then
    const expected = new Date('2024-02-14')
    expect(result).toEqual(expected)
  })

  it('should find the correct day when given a start date and any future date', () => {
    // Given
    const startDate = new Date('2024-02-10')
    const givenDate = new Date('2024-02-12')

    // When
    const result = findFirstMatchingDayOccurrence(startDate, givenDate)
    // Then
    const expected = new Date('2024-02-12')
    expect(result).toEqual(expected)
  })

  it('should loop correctly to find the next matching day', () => {
    // Given
    const startDate = new Date('2024-02-10')
    const givenDate = new Date('2024-02-14')
    // When
    const result = findFirstMatchingDayOccurrence(startDate, givenDate)
    // Then
    const expected = new Date('2024-02-14')
    expect(result).toEqual(expected)
  })

  it('should work with edge case where startDate is exactly the given date', () => {
    // Given
    const startDate = new Date('2024-02-12')
    const givenDate = new Date('2024-02-12')
    // When
    const result = findFirstMatchingDayOccurrence(startDate, givenDate)
    // Then
    expect(result).toEqual(startDate)
  })

  it('should handle a leap year correctly', () => {
    // Given
    const startDate = new Date('2024-02-28')
    const givenDate = new Date('2024-03-01')
    // When
    const result = findFirstMatchingDayOccurrence(startDate, givenDate)
    // Then
    const expected = new Date('2024-03-01')
    expect(result).toEqual(expected)
  })
})

describe('addOneDay', () => {
  it('should add one day to a given date', () => {
    // Given
    const date = new Date('2024-02-12')
    // When
    const result = addOneDay(date)
    // Then
    const expected = new Date('2024-02-13')
    expect(result).toEqual(expected)
  })

  it('should correctly handle the transition from one month to the next', () => {
    // Given
    const date = new Date('2024-02-28')

    // When
    const result = addOneDay(date)
    // Then
    const expected = new Date('2024-02-29')
    expect(result).toEqual(expected)
  })

  it('should correctly handle the transition from one month to the next (non-leap year)', () => {
    // Given
    const date = new Date('2023-02-28')
    // When
    const result = addOneDay(date)
    // Then
    const expected = new Date('2023-03-01')
    expect(result).toEqual(expected)
  })

  it('should correctly handle the transition from December 31st to January 1st of the next year', () => {
    // Given
    const date = new Date('2023-12-31')
    // When
    const result = addOneDay(date)
    // Then
    const expected = new Date('2024-01-01')
    expect(result).toEqual(expected)
  })

  it('should correctly handle the transition from the end of a month to the next month', () => {
    // Given
    const date = new Date('2024-01-31')
    // When
    const result = addOneDay(date)
    // Then
    const expected = new Date('2024-02-01')
    expect(result).toEqual(expected)
  })

  it('should return the same date object when adding a day to the current date', () => {
    // Given
    const date = new Date('2024-02-12')
    // When
    const result = addOneDay(date)
    // Then
    const expected = new Date('2024-02-13')
    expect(result.getTime()).toBe(expected.getTime())
  })
})
