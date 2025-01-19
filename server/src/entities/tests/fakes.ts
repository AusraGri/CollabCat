import type {
  Tasks,
  Groups,
  User,
  Categories,
  RecurringPattern,
  UserGroups,
  CompletedTasks,
} from '@server/database/types'
import type { Insertable } from 'kysely'
import { random } from '@tests/utils/random'
import type { AuthUser } from '../user'
import type { AuthGroup } from '../groups'

const randomId = () =>
  random.integer({
    min: 1,
    max: 1000000,
  })

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUser = <T extends Partial<Insertable<User>>>(
  overrides: T = {} as T
) =>
  ({
    email: random.email(),
    username: random.first(),
    auth0Id: random.last(),
    ...overrides,
  }) satisfies Insertable<User>

export const fakeAuthUser = <T extends Partial<AuthUser>>(
  overrides: T = {} as T
): AuthUser => ({
  id: randomId(),
  email: random.email(),
  ...overrides,
})
export const fakeAuthGroup = <T extends Partial<AuthGroup>>(
  overrides: T = {} as T
): AuthGroup => ({
  groupId: randomId(),
  role: 'Admin',
  ...overrides,
})

/**
 * Generates a fake article with some default test data.
 * @param overrides userId and any properties that should be different from default fake data.
 */
export const fakeTask = <T extends Partial<Insertable<Tasks>>>(overrides: T) =>
  ({
    title: random.string().slice(1, 20),
    description: random.paragraph().slice(1, 100),
    createdByUserId: randomId(),
    startDate: random.date(),
    ...overrides,
  }) satisfies Insertable<Tasks>

/**
 * Generates a fake completed task with some default test data.
 * @param overrides userId and any properties that should be different from default fake data.
 */
export const fakeCompletedTask = <
  T extends Partial<Insertable<CompletedTasks>>,
>(
  overrides: T
) =>
  ({
    taskId: randomId(),
    completedAt: random.date(),
    instanceDate: random.date(),
    ...overrides,
  }) satisfies Insertable<CompletedTasks>

/**
 * Generates a fake group with some default test data.
 * @param overrides createdByUserId and any properties that should be different from default fake data.
 */
export const fakeGroup = <T extends Partial<Insertable<Groups>>>(
  overrides: T
) =>
  ({
    name: random.string(),
    createdByUserId: randomId(),
    ...overrides,
  }) satisfies Insertable<Groups>

/**
 * Generates a fake group with some default test data.
 * @param overrides groupId and any properties that should be different from default fake data.
 */
export const fakeUserGroup = <T extends Partial<Insertable<UserGroups>>>(
  overrides: T
) =>
  ({
    groupId: randomId(),
    role: 'Admin',
    userId: randomId(),
    ...overrides,
  }) satisfies Insertable<UserGroups>

/**
 * Generates a fake category with some default test data.
 * @param overrides createdByUserId and any properties that should be different from default fake data.
 */
export const fakeCategory = <T extends Partial<Insertable<Groups>>>(
  overrides: T
) =>
  ({
    title: random.string().slice(0, 7),
    createdByUserId: randomId(),
    ...overrides,
  }) satisfies Insertable<Categories>

/**
 * Generates a fake recurring pattern with some default test data.
 * @param overrides createdByUserId and any properties that should be different from default fake data.
 */
export const fakePattern = <T extends Partial<Insertable<RecurringPattern>>>(
  overrides: T
) =>
  ({
    taskId: randomId(),
    separationCount: 0,
    recurringType: 'daily',
    ...overrides,
  }) satisfies Insertable<RecurringPattern>