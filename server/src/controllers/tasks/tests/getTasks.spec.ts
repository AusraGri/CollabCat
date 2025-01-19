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

const { getTasks } = createCaller(authContext({ db }, user))

it('should return a task by id', async () => {
  const { ...taskWithoutParentTaskId } = task
  // When (ACT)
  const taskResponse = await getTasks({ id: task.id })
  // Then (ASSERT)
  expect(taskResponse[0]).toMatchObject(taskWithoutParentTaskId)
})

it('should return [] if the task does not exist', async () => {
  const nonExistentId = task.id + taskOther.id

  // When (ACT)
  await expect(getTasks({ id: nonExistentId })).resolves.toEqual([])
})
