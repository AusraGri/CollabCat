import type { RecurrencePattern, Tasks, User } from '@server/shared/types'
import type { Insertable } from 'kysely'
import { Chance } from 'chance'

export const random = process.env.CI ? Chance(1) : Chance()

/**
 * Creates a new user with a random email and password. We want a random email
 * as our E2E tests can run against a real database, and we don't want to
 * our tests to fail because of a duplicate email.
 */
export const fakeUser = <T extends Insertable<User>>(overrides: Partial<T> = {} as T) => ({
  email: random.email(),
  username: random.first(),
  ...overrides,
})

export const fakeTask = <T extends Insertable<Tasks>>(overrides: Partial<T> = {} as T) => ({
  title: random.word(),
  ...overrides,
})

export const fakeRecurrencePattern = <T extends Insertable<RecurrencePattern>>(overrides: Partial<T> = {} as T) => ({
  separationCount: random.integer({ min: 1, max: 5 }),
  recurringType: 'daily',
  ...overrides,
})