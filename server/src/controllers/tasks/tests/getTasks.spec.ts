import { authContext } from '@tests/utils/context'
import { fakeTask, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())

const [user, userOther] = await insertAll(db, 'user', [fakeUser(), fakeUser()])

const [task, taskOther] = await insertAll(db, 'tasks', [
  fakeTask({ createdByUserId: user.id }),
  fakeTask({ createdByUserId: userOther.id }),
])

const { get } = createCaller(authContext({ db }, user))


it('should return a task by id', async () => {
  // When (ACT)
  const taskResponse = await get({id: task.id})

  // Then (ASSERT)
  expect(taskResponse[0]).toMatchObject(task)
})

it('should throw an error if the task does not exist', async () => {
  const nonExistantId = task.id + taskOther.id

  // When (ACT)
  await expect(get({id: nonExistantId})).rejects.toThrowError(/not found/i)
})
