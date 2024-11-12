import { authContext, requestContext } from '@tests/utils/context'
import {
  fakeUser,
  fakeGroup,
  fakeUserGroup,
} from '@server/entities/tests/fakes'
import { createTestDatabase, cleanDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const testDb = createTestDatabase()
await cleanDatabase(testDb)
const db = await wrapInRollbacks(testDb)

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { remove } = createCaller(requestContext({ db }))

  // ACT & ASSERTs
  await expect(remove({ id: 12, groupId: 0 })).rejects.toThrow(
    /unauthenticated/i
  )
})

it('should throw an error if user is authenticated, but is not in the group', async () => {
  // ARRANGE
  const [user, userTwo] = await insertAll(db, 'user', [fakeUser(), fakeUser()])

  const [group] = await insertAll(db, 'groups', [
    fakeGroup({ createdByUserId: userTwo.id }),
  ])

  const [userGroup] = await insertAll(db, 'userGroups', [
    fakeUserGroup({ userId: userTwo.id, groupId: group.id }),
  ])

  const { remove } = createCaller(authContext({ db }, user))

  // ACT & ASSERTs
  await expect(
    remove({ id: group.id, groupId: userGroup.groupId })
  ).rejects.toThrow(/unauthorized/i)
})

it('should throw an error if user is authenticated, belongs to the group, but does not have permission', async () => {
  // ARRANGE
  const [user, userTwo] = await insertAll(db, 'user', [fakeUser(), fakeUser()])

  const [group] = await insertAll(db, 'groups', [
    fakeGroup({ createdByUserId: userTwo.id }),
  ])

  await insertAll(db, 'userGroups', [
    fakeUserGroup({ userId: userTwo.id, groupId: group.id, role: 'User' }),
  ])

  const { remove } = createCaller(authContext({ db }, user))

  // ACT & ASSERTs
  await expect(remove({ id: group.id, groupId: group.id })).rejects.toThrow(
    /unauthorized/i
  )
})

it('should delete group by id', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', [fakeUser()])

  const [group] = await insertAll(db, 'groups', [
    fakeGroup({ createdByUserId: user.id }),
  ])

  await insertAll(db, 'userGroups', [
    fakeUserGroup({ userId: user.id, groupId: group.id }),
  ])

  const { remove } = createCaller(authContext({ db }, user))

  let allGroups = await selectAll(db, 'groups')

  expect(allGroups).toHaveLength(1)
  // ACT
  const groupDeleted = await remove({ id: group.id, groupId: group.id })

  // ASSERT
  expect(groupDeleted).toBe(true)

  const [groupExist] = await selectAll(db, 'groups', (eb) =>
    eb('id', '=', group.id)
  )

  expect(groupExist).toBe(undefined)

  allGroups = await selectAll(db, 'groups')

  expect(allGroups).toHaveLength(0)
})
