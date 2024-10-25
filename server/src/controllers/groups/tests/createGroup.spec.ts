import { authContext, requestContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll, selectAll } from '@tests/utils/records'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const db = await wrapInRollbacks(createTestDatabase())

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { create } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
    create({
      name: 'Name',
    })
  ).rejects.toThrow(/unauthenticated/i)
})

it('should create a persisted group', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const { create } = createCaller(authContext({ db }, user))

  // ACT
  const groupsReturned = await create({
    name: 'New Group',
  })

  // ASSERT
  expect(groupsReturned).toMatchObject({
    id: expect.any(Number),
    createdByUserId: user.id,
    name: 'New Group',
  })

  const [groupsCreated] = await selectAll(db, 'groups', (eb) =>
    eb('id', '=', groupsReturned.id)
  )

  expect(groupsCreated).toMatchObject(groupsReturned)
})
