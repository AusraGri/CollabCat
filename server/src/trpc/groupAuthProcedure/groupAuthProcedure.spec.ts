import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import {
  fakeGroup,
  fakeUser,
  fakeUserGroup,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
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

const createCaller = createCallerFactory(routes)
const authenticated = createCaller(authContext({ db }, userOne))

it('should pass if user belongs to the group', async () => {
  const response = await authenticated.testCall({ groupId: groupOne.id })

  expect(response).toEqual('passed')
})

it('should throw an error if groupId is not provided', async () => {
  await expect((authenticated.testCall as any)({})).rejects.toThrow(/group/i)
})

it('should throw an error if user provides a non-existing groupId', async () => {
  await expect(
    (authenticated.testCall as any)({ groupId: 999 })
  ).rejects.toThrow(/group/i)
})

it('should throw an error if user provides null groupId', async () => {
  await expect(
    authenticated.testCall({ groupId: null as any })
  ).rejects.toThrow(/group/i)
})

it('should throw an error if user does not belong to the group', async () => {
  await expect(
    authenticated.testCall({ groupId: groupTwo.id })
  ).rejects.toThrow(/group/i)
})
