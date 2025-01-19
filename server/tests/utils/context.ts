import { authGroup, type AuthGroup } from '@server/entities/groups'
import { fakeAuthUser, fakeAuthGroup } from '@server/entities/tests/fakes'
import { authUserSchema, type AuthUser } from '@server/entities/user'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import type { Context, ContextMinimal } from '@server/trpc'

export const requestContext = (
  context: Partial<Context> & ContextMinimal
): Context => ({
  req: {
    auth: {
      token: 'token',
      payload: {
        sub: 'sub',
      },
    },
    isTest: true,
    header: () => undefined,
    get: () => undefined,
  } as any,
  res: {
    cookie: () => undefined,
  } as any,
  ...context,
})

export const authGroupRepos = (group: AuthGroup, user: AuthUser) => ({
  groupsRepository: {
    getGroup: vi.fn(async () => ([{id: group.groupId, createdByUserId: user.id, name: 'Group'}])),
    getRole: vi.fn(async() => ({role: group.role})),
  } satisfies Partial<GroupRepository>
})

export const authContext = (
  context: Partial<Context> & ContextMinimal,
  user: AuthUser = fakeAuthUser(),
): Context => ({
  authUser: authUserSchema.parse(user),
  ...requestContext({
    ...context
  }),
})

export const authGroupContext = (
  context: Partial<Context> & ContextMinimal,
  user: AuthUser = fakeAuthUser(),
  group: AuthGroup = fakeAuthGroup()
): Context => ({
  authUser: authUserSchema.parse(user),
  userGroup: authGroup.parse(group),
  ...requestContext({
    ...context
  }),
})

export const authRepoContext = (
  repos: any, // Context['repos'], but easier to work with any in tests
  user: AuthUser = fakeAuthUser(),
): Context => ({
  authUser: authUserSchema.parse(user),
  ...requestContext({
    db: {} as any,
    repos,
  }),
})
export const authGroupRepoContext = (
  repos: any, // Context['repos'], but easier to work with any in tests
  user: AuthUser = fakeAuthUser(),
  group: AuthGroup = fakeAuthGroup()
): Context => ({
  authUser: authUserSchema.parse(user),
  userGroup: authGroup.parse(group),
  ...requestContext({
    db: {} as any,
    repos,
  }),
})
export const repoContext = (
  repos: any, // Context['repos'], but easier to work with any in tests
): Context => ({
  ...requestContext({
    db: {} as any,
    repos,
  }),
})
