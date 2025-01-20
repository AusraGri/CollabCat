import { createTestDatabase } from '@tests/utils/database'
import {
  fakeTask,
  fakeUser,
  fakeGroup,
  fakeCategory,
  fakePattern,
  fakeCompletedTask,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { pick } from 'lodash-es'
import { tasksKeysPublic } from '@server/entities/tasks'
import { tasksRepository } from '../tasksRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = tasksRepository(db)

// An example of repository tests with a database.
const [userOne, userTwo, userThree] = await insertAll(db, 'user', [
  fakeUser(),
  fakeUser(),
  fakeUser(),
])
const [groupOne, groupTwo] = await insertAll(db, 'groups', [
  fakeGroup({ createdByUserId: userOne.id }),
  fakeGroup({ createdByUserId: userTwo.id }),
])
const [categoryOne, categoryTwo] = await insertAll(db, 'categories', [
  fakeCategory({ createdByUserId: userOne.id }),
  fakeCategory({ createdByUserId: userTwo.id }),
])
const [taskOne, taskTwo] = await insertAll(db, 'tasks', [
  fakeTask({
    createdByUserId: userOne.id,
    groupId: groupOne.id,
    categoryId: categoryOne.id,
    isCompleted: true,
    title: 'Task One',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 27),
  }),
  fakeTask({
    title: 'Task Two',
    createdByUserId: userTwo.id,
    assignedUserId: userThree.id,
    groupId: groupTwo.id,
    categoryId: categoryTwo.id,
    startDate: new Date(2024, 0, 1),
    endDate: null,
  }),
])

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [patternOne, patternTwo] = await insertAll(db, 'recurringPattern', [
  fakePattern({
    taskId: taskOne.id,
    recurringType: 'Daily',
    separationCount: 1,
  }),
  fakePattern({
    taskId: taskTwo.id,
    recurringType: 'Weekly',
    dayOfWeek: [1, 2, 3, 4],
    separationCount: 0,
  }),
])

await insertAll(db, 'completedTasks', [
  fakeCompletedTask({
    taskId: taskOne.id,
    instanceDate: new Date(2024, 2, 26),
  }),
])

describe('create', () => {
  it('should create a task', async () => {
    // Given
    const task = fakeTask({ createdByUserId: userThree.id })

    // When
    const createdTask = await repository.create(task)

    // Then
    expect(createdTask).toMatchObject({
      id: expect.any(Number),
      ...pick(tasksKeysPublic),
      createdByUserId: userThree.id,
    })
  })
})

describe('get', () => {
  it('should get a task by id', async () => {
    // When
    const [task] = await repository.getTasks({ id: taskOne.id })

    // Then
    expect(task).toMatchObject({
      ...taskOne,
    })
  })

  it('should get task by the user who created the task', async () => {
    // When
    const [task] = await repository.getTasks({ createdByUserId: userTwo.id })

    // Then
    expect(task).toMatchObject({
      ...taskTwo,
    })
  })

  it('should get task by the assigned user to the task', async () => {
    // When
    const [task] = await repository.getTasks({ assignedUserId: userThree.id })

    // Then
    expect(task).toMatchObject({
      ...taskTwo,
    })
  })

  it('should get task by the category id', async () => {
    // When
    const [task] = await repository.getTasks({ categoryId: categoryOne.id })

    // Then
    expect(task).toMatchObject({
      ...taskOne,
    })
  })

  it('should get tasks for the given day', async () => {
    // Given
    const date = new Date(2024, 2, 26)
    // When
    const task = await repository.getTasksDue(date, userOne.id)

    // Then
    expect(task).toHaveLength(1)
    expect(task[0].id).toBe(taskOne.id)
    expect(task[0].recurrence).toMatchObject(patternOne)
  })
})

describe('update', () => {
  it('should update task', async () => {
    // Given
    const updatedTask = {
      title: 'Task One Updated',
      assignedUserId: userTwo.id,
      categoryId: categoryOne.id,
    }
    // When
    const task = await repository.updateTask({
      id: taskOne.id,
      task: updatedTask,
      recurrence: null,
    })
    const [updated] = await repository.getTasks({ id: taskOne.id })
    // Then
    expect(task).toBe(true)
    expect(updated.isCompleted).toBe(taskOne.isCompleted)
    expect(updated.title).toBe(updatedTask.title)
    expect(updated.assignedUserId).toBe(updatedTask.assignedUserId)
    expect(updated.categoryId).toBe(updatedTask.categoryId)
  })

  it('should throw an error if there is no task id to update', async () => {
    // Given
    const taskId = 37

    // When
    await expect(
      repository.updateTask({
        id: taskId,
        task: { title: 'Update' },
        recurrence: null,
      })
    ).rejects.toThrowError()
  })
})
