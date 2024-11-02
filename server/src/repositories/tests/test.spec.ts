import { createTestDatabase } from '@tests/utils/database'
import {
  fakeTask,
  fakeUser,
  fakePattern,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll} from '@tests/utils/records'
import { pick } from 'lodash-es'
import { tasksKeysPublic } from '@server/entities/tasks'
import { tasksRepositoryTest } from '../test'

const db = await wrapInRollbacks(createTestDatabase())
const repository = tasksRepositoryTest(db)

// An example of repository tests with a database.
// const [fakeType, fakeTypeTwo] = await insertAll(db, 'recurringTypes', [fakeRecurringType({recurringType: 'Daily'}), fakeRecurringType({recurringType: 'Weekly'})])
const [userOne, userTwo, userThree] = await insertAll(db, 'user', [fakeUser(), fakeUser(), fakeUser()])
const [taskOne, taskTwo] = await insertAll(db, 'tasks', [
  fakeTask({
    createdByUserId: userOne.id,
    isCompleted: true,
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 27),
    title: 'Task One'

  }),
  fakeTask({
    createdByUserId: userTwo.id,
    assignedUserId: userThree.id,
    startDate: new Date(2024, 0, 1),
  }),
])
const [patternOne, patternTwo] = await insertAll(db, 'recurringPattern', [
  fakePattern({
   taskId: taskOne.id,
   recurringTypeId: 1,
  }),
  fakePattern({
    taskId: taskTwo.id,
    recurringTypeId: 2,
    dayOfWeek: [1, 2],
    separationCount:0
   }),
])

describe('get', () => {
    it.skip('should get daily task', async () => {
      // Given
      const date = new Date(2025, 2, 23)
      // When
      const task = await repository.getTasksDue(date)

      console.log(task)
      // Then
      expect(task).toMatchObject({
        id: expect.any(Number),
        ...pick(tasksKeysPublic),
        createdByUserId: userOne.id
      })
    })
  })

