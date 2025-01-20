import {
  authGroupContext,
  authContext,
  authRepoContext,
} from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import {
  fakeGroup,
  fakeUser,
  fakeUserGroup,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import { createCallerFactory, router } from '..'
import { groupAuthProcedure } from '.'

const routes = router({
  testCall: groupAuthProcedure.query(() => 'passed'),
})

const db = await wrapInRollbacks(createTestDatabase())
const [userOne, userTwo] = await insertAll(db, 'user', [fakeUser(), fakeUser()])

const [groupOne, groupTwo] = await insertAll(db, 'groups', [
  fakeGroup({ createdByUserId: userOne.id }),
  fakeGroup({ createdByUserId: userTwo.id }),
])

await insertAll(db, 'userGroups', [
  fakeUserGroup({ userId: userOne.id, groupId: groupOne.id }),
  fakeUserGroup({ userId: userTwo.id, groupId: groupTwo.id }),
])

const mockReq = {
  isTest: true,
} as any

const mockRes = {} as any

const createCaller = createCallerFactory(routes)
const authenticated = createCaller(
  authGroupContext({ db, req: mockReq, res: mockRes }, userOne, {
    groupId: groupOne.id,
    role: 'Admin',
  })
)

it('should pass if user belongs to the group', async () => {
  const response = await authenticated.testCall({ groupId: groupOne.id })

  expect(response).toEqual('passed')
})

it('should throw an error if groupId is not provided', async () => {
  await expect((authenticated.testCall as any)({})).rejects.toThrow(/group/i)
})

it('should throw an error if user provides a non-existing groupId', async () => {
  const notAuthenticated = createCaller(
    authContext({ db, req: mockReq, res: mockRes }, userOne)
  )
  await expect(
    (notAuthenticated.testCall as any)({ groupId: 999 })
  ).rejects.toThrow(/group/i)
})

it('should throw an error if user provides null groupId', async () => {
  await expect(
    authenticated.testCall({ groupId: null as any })
  ).rejects.toThrow(/group/i)
})

it('should throw an error if user does not belong to the group', async () => {
  const groupRepos = {
    groupsRepository: {
      getGroup: vi.fn(async () => [
        { id: groupOne.id, createdByUserId: 1, name: 'Group' },
      ]),
      getRole: vi.fn(async () => undefined),
    } satisfies Partial<GroupRepository>,
  }

  const differentGroup = createCaller(authRepoContext(groupRepos))
  await expect(differentGroup.testCall({ groupId: 2 })).rejects.toThrow(
    /group/i
  )
})
