/* eslint-disable @typescript-eslint/no-unused-vars */
import { authContext } from '@tests/utils/context'
import {
  fakePattern,
  fakeTask,
  fakeUser,
  fakeCompletedTask,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())
const [user] = await insertAll(db, 'user', [fakeUser()])

const [task, taskTwo, taskThree] = await insertAll(db, 'tasks', [
  fakeTask({ createdByUserId: user.id, startDate: new Date(2024, 10, 1) }),
  fakeTask({ createdByUserId: user.id, startDate: new Date(2024, 10, 4) }),
  fakeTask({ createdByUserId: user.id, startDate: new Date(2024, 10, 4) }),
])

const [taskCompleted] = await insertAll(
  db,
  'completedTasks',
  fakeCompletedTask({
    taskId: taskThree.id,
    instanceDate: new Date(2024, 10, 11),
  })
)

const [patternOne, patternTwo, patterThree] = await insertAll(
  db,
  'recurringPattern',
  [
    fakePattern({ taskId: task.id }),
    fakePattern({
      taskId: taskTwo.id,
      recurringType: 'Weekly',
      separationCount: 1,
      dayOfWeek: [1, 2, 3, 4],
    }),
    fakePattern({
      taskId: taskThree.id,
      recurringType: 'Weekly',
      separationCount: 0,
      dayOfWeek: [1, 2, 3, 4],
    }),
  ]
)

const { getDueTasks } = createCaller(authContext({ db }, user))

it('should return a task for the given date', async () => {
  const date = new Date(2024, 10, 11)

  // When (ACT)
  const taskResponse = await getDueTasks(date)

  // Then (ASSERT)
  expect(taskResponse).toHaveLength(2)
  const expectedIds = [task.id, taskThree.id]
  const actualIds = taskResponse.map((item) => item.id)
  expect(actualIds).toEqual(expect.arrayContaining(expectedIds))
})

it('should return empty array id no tasks for the day', async () => {
  const date = new Date(2023, 10, 11)

  // When (ACT)
  const taskResponse = await getDueTasks(date)

  // Then (ASSERT)
  expect(taskResponse).toHaveLength(0)
  expect(taskResponse).toStrictEqual([])
})
