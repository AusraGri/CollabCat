import { authContext, requestContext } from '@tests/utils/context'
import { fakeUser, fakeGroup } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const db = await wrapInRollbacks(createTestDatabase())

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { remove } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(remove(12)).rejects.toThrow(/unauthenticated/i)
})

it('should delete group by id', async () => {
  // ARRANGE
  const [user, userOther] = await insertAll(db, 'user', [
    fakeUser(),
    fakeUser(),
  ])

  const [group, groupOther] = await insertAll(db, 'groups', [
    fakeGroup({ createdByUserId: user.id }),
    fakeGroup({ createdByUserId: userOther.id }),
  ])
  const { remove } = createCaller(authContext({ db }, user))

  let allGroups = await selectAll(db, 'groups')

  expect(allGroups).toHaveLength(2)
  // ACT
  const groupDeleted = await remove(group.id)

  // ASSERT
  expect(groupDeleted).toBe(true)

  const [groupExist] = await selectAll(db, 'groups', (eb) =>
    eb('id', '=', group.id)
  )

  expect(groupExist).toBe(undefined)

  const [groupLeft] = await selectAll(db, 'groups')

  expect(groupLeft).toMatchObject(groupOther)

  allGroups = await selectAll(db, 'groups')

  expect(allGroups).toHaveLength(1)
})
