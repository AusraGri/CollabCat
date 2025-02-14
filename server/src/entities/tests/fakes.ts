import type {
  Tasks,
  Groups,
  User,
  Categories,
  RecurringPattern,
  UserGroups,
  CompletedTasks,
  Rewards,
  Invitations,
  Points,
  PointClaims,
} from '@server/database/types'
import type { Insertable, Selectable } from 'kysely'

import { random } from '@tests/utils/random'
import type { AuthUser, UserPublic } from '../user'
import type { AuthGroup } from '../groups'

export const randomId = () =>
  random.integer({
    min: 1,
    max: 10000000,
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

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUserPublic = <T extends Partial<Insertable<User>>>(
  overrides: T = {} as T
) =>
  ({
    email: random.email(),
    username: random.first(),
    picture: random.last(),
    id: randomId(),
    ...overrides,
  }) satisfies UserPublic

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
 * Generates a fake task with some default test data.
 * @param overrides userId and any properties that should be different from default fake data.
 */
export const fakeTask = <T extends Partial<Insertable<Tasks>>>(
  overrides: T = {} as T
) =>
  ({
    title: random.string().slice(1, 20),
    description: random.paragraph().slice(1, 100),
    createdByUserId: randomId(),
    startDate: random.date(),
    ...overrides,
  }) satisfies Insertable<Tasks>

/**
 * Generates a fake task data with some default test data.
 * @param overrides userId and any properties that should be different from default fake data.
 */
export const fakeTaskData = <T extends Partial<Selectable<Tasks>>>(
  overrides: T = {} as T
) =>
  ({
    title: random.string().slice(1, 20),
    description: random.paragraph().slice(1, 100),
    createdByUserId: randomId(),
    startDate: null,
    id: randomId(),
    assignedUserId: null,
    categoryId: null,
    isCompleted: false,
    completedAt: null,
    groupId: null,
    points: null,
    endDate: null,
    isRecurring: false,
    startTime: null,
    recurrence: null,
    completed: [],
    ...overrides,
  }) satisfies Selectable<Tasks>

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
 * Generates a fake points with some default test data.
 * @param overrides createdByUserId and any properties that should be different from default fake data.
 */
export const fakePoints = <T extends Partial<Insertable<Points>>>(
  overrides: T = {} as T
) =>
  ({
    points: random.integer({ min: 1, max: 50 }),
    userId: randomId(),
    groupId: randomId(),
    ...overrides,
  }) satisfies Insertable<Points>

/**
 * Generates a fake points claims with some default test data.
 * @param overrides createdByUserId and any properties that should be different from default fake data.
 */
export const fakePointClaim = <T extends Partial<Insertable<PointClaims>>>(
  overrides: T = {} as T
) =>
  ({
    taskInstanceDate: random.date(),
    userId: randomId(),
    taskId: randomId(),
    ...overrides,
  }) satisfies Insertable<PointClaims>

/**
 * Generates a fake reward with some default test data.
 * @param overrides createdByUserId and any properties that should be different from default fake data.
 */
export const fakeReward = <T extends Partial<Insertable<Rewards>>>(
  overrides: T = {} as T
) =>
  ({
    title: random.string(),
    createdByUserId: randomId(),
    amount: null,
    cost: random.integer({ min: 1, max: 100 }),
    targetUserIds: null,
    groupId: null,
    ...overrides,
  }) satisfies Insertable<Rewards>

/**
 * Generates a fake group with some default test data.
 * @param overrides groupId and any properties that should be different from default fake data.
 */
export const fakeUserGroup = <T extends Partial<Insertable<UserGroups>>>(
  overrides: T = {} as T
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
export const fakeCategory = <T extends Partial<Insertable<Categories>>>(
  overrides: T = {} as T
) =>
  ({
    title: random.string().slice(0, 7),
    createdByUserId: randomId(),
    groupId: null,
    isDefault: false,
    ...overrides,
  }) satisfies Insertable<Categories>

/**
 * Generates a fake recurring pattern with some default test data.
 * @param overrides createdByUserId and any properties that should be different from default fake data.
 */
export const fakePattern = <T extends Partial<Insertable<RecurringPattern>>>(
  overrides: T = {} as T
) =>
  ({
    taskId: randomId(),
    separationCount: 0,
    recurringType: 'daily',
    ...overrides,
  }) satisfies Insertable<RecurringPattern>

/**
 * Generates a fake invitation with some default test data.
 * @param overrides createdByUserId and any properties that should be different from default fake data.
 */
export const fakeInvitation = <T extends Partial<Insertable<Invitations>>>(
  overrides: T = {} as T
) =>
  ({
    email: random.email(),
    groupId: randomId,
    invitationToken: random.string(),
    ...overrides,
  }) satisfies Insertable<Invitations>
