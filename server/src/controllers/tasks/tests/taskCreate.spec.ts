import { authContext, requestContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())

const newTask = {
  task: {
    title: 'My New Task',
    startDate: '2024-11-11',
  },
}

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { createTask } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(createTask(newTask)).rejects.toThrow(/unauthenticated/i)
})

it('should create a persisted task', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const { createTask } = createCaller(authContext({ db }, user))

  // ACT
  const taskReturned = await createTask(newTask)
  // ASSERT
  expect(taskReturned).toMatchObject({
    id: expect.any(Number),
    completedAt: null,
    assignedUserId: null,
    categoryId: null,
    isCompleted: false,
    createdByUserId: user.id,
    description: null,
    groupId: null,
    points: null,
    startDate: expect.any(Date),
    startTime: null,
    title: 'My New Task',
    completed: expect.any(Array),
    recurrence: null
  })

})
