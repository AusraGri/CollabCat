import { createTestDatabase } from '@tests/utils/database'
import {
  fakeTask,
  fakeUser,
  fakeGroup,
  fakeCategory,
  fakePattern,
  fakeCompletedTask,
  randomId,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { pick } from 'lodash-es'
import { tasksKeysAll } from '@server/entities/tasks'
import { DeleteResult } from 'kysely'
import { tasksRepository } from '../tasksRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = tasksRepository(db)

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
const [taskOne, taskTwo, taskThree, taskFour] = await insertAll(db, 'tasks', [
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
  fakeTask({
    title: 'Task Three',
    createdByUserId: userOne.id,
    assignedUserId: userOne.id,
    groupId: null,
    categoryId: categoryTwo.id,
    startDate: new Date(2024, 0, 1),
    endDate: null,
  }),
  fakeTask({ createdByUserId: userOne.id }),
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [taskOneCompl, taskOneComplTwo] = await insertAll(db, 'completedTasks', [
  fakeCompletedTask({
    taskId: taskOne.id,
    instanceDate: new Date(2024, 2, 26),
  }),
  fakeCompletedTask({
    taskId: taskOne.id,
    instanceDate: new Date(2025, 1, 26),
  }),
])

describe('create task', () => {
  it('should create a task with no recurrence', async () => {
    // Given
    const task = fakeTask({ createdByUserId: userThree.id })

    // When
    const createdTask = await repository.createTask({ task })

    // Then
    expect(createdTask).toMatchObject({
      id: expect.any(Number),
      ...pick(tasksKeysAll),
      createdByUserId: userThree.id,
      recurrence: null,
      completed: expect.any(Array),
    })
  })

  it('should create a task with recurrence', async () => {
    // Given
    const task = fakeTask({ createdByUserId: userThree.id, isRecurring: true })
    const { taskId, ...recurrenceData } = fakePattern()

    // When
    const createdTask = await repository.createTask({
      task,
      recurrence: { ...recurrenceData },
    })

    // Then
    expect(createdTask).toMatchObject({
      id: expect.any(Number),
      ...pick(tasksKeysAll),
      createdByUserId: userThree.id,
      recurrence: expect.objectContaining({ ...recurrenceData }),
      completed: expect.any(Array),
    })
  })

  it('should throw error if task is recurring, but no recurrence patter was provided', async () => {
    // Given
    const task = fakeTask({ createdByUserId: userThree.id, isRecurring: true })

    // When & Then
    await expect(repository.createTask({ task })).rejects.toThrowError(
      /missing task data/i
    )
  })

  it('should throw error if task data is invalid and creation fails', async () => {
    // Given
    const task = { anything: 'any' }

    // When & Then
    // @ts-expect-error
    await expect(repository.createTask({ task })).rejects.toThrowError(
      /does not exist/i
    )
  })

  it('should throw error if task recurrence insertion fails', async () => {
    // Given
    const task = fakeTask({ createdByUserId: userThree.id, isRecurring: true })
    const recurrence = { anything: 'any' }
    // When & Then

    await expect(
      // @ts-expect-error
      repository.createTask({ task, recurrence })
    ).rejects.toThrowError(/failed to save recurrence/i)
  })
})

describe('get tasks', () => {
  it('should get a task by id', async () => {
    // When
    const [task] = await repository.getTasks({ id: taskOne.id })

    // Then
    expect(task).toMatchObject({
      ...taskOne,
      recurrence: expect.any(Object),
      completed: expect.any(Array),
    })
  })

  it('should get task by the user who created the task', async () => {
    // When
    const [task] = await repository.getTasks({ createdByUserId: userTwo.id })

    // Then
    expect(task).toMatchObject({
      ...taskTwo,
      recurrence: expect.any(Object),
      completed: expect.any(Array),
    })
  })

  it('should get task by the assigned user to the task', async () => {
    // When
    const [task] = await repository.getTasks({ assignedUserId: userThree.id })

    // Then
    expect(task).toMatchObject({
      ...taskTwo,
      recurrence: expect.any(Object),
      completed: expect.any(Array),
    })
  })

  it('should get task by the category id', async () => {
    // When
    const [task] = await repository.getTasks({ categoryId: categoryOne.id })

    // Then
    expect(task).toMatchObject({
      ...taskOne,
      recurrence: expect.any(Object),
      completed: expect.any(Array),
    })
  })
})

describe('get due tasks', () => {
  it('should get all due tasks for user by the given date and user id', async () => {
    // Given
    const date = new Date(2024, 2, 26)
    // When
    const task = await repository.getTasksDue(date, userOne.id)

    // Then
    expect(task).toHaveLength(2)
    expect(task).toMatchObject([taskOne, taskThree])
  })

  it('should get all due personal tasks for user by the given date and user id', async () => {
    // Given
    const date = taskThree.startDate as Date
    // When
    const task = await repository.getPersonalTasksDue(date, userOne.id)

    // Then
    expect(task).toHaveLength(1)
    expect(task[0].id).toBe(taskThree.id)
    expect(task[0].recurrence).toBe(null)
  })

  it('should get all due tasks for group by the given date and group id', async () => {
    // Given
    const date = new Date(2024, 2, 26)
    const groupId = groupOne.id
    // When
    const task = await repository.getGroupTasksDue({ date, groupId })

    // Then
    expect(task).toHaveLength(1)
    expect(task[0].id).toBe(taskOne.id)
    expect(task[0].recurrence).toMatchObject(patternOne)
  })

  it('should get all due tasks for group by the given date, group id and user id', async () => {
    // Given
    const date = new Date(2024, 2, 26)
    const groupId = groupOne.id
    const userId = userOne.id
    const userIdTwo = userTwo.id
    // When
    const task = await repository.getGroupTasksDue({ date, groupId, userId })
    const taskUserTwo = await repository.getGroupTasksDue({
      date,
      groupId,
      userId: userIdTwo,
    })

    // Then
    expect(task).toHaveLength(1)
    expect(task[0].id).toBe(taskOne.id)
    expect(task[0].recurrence).toMatchObject(patternOne)

    expect(taskUserTwo).toHaveLength(0)
  })
})

describe('update task ', () => {
  it('should update task without recurrence', async () => {
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
    })
    const [updated] = await repository.getTasks({ id: taskOne.id })
    // Then
    expect(task).toBe(true)
    expect(updated.isCompleted).toBe(taskOne.isCompleted)
    expect(updated.title).toBe(updatedTask.title)
    expect(updated.assignedUserId).toBe(updatedTask.assignedUserId)
    expect(updated.categoryId).toBe(updatedTask.categoryId)
  })

  it('should update recurring tasks recurrence', async () => {
    // Given
    const updatedTask = {
      title: 'Task One Updated',
      assignedUserId: userTwo.id,
      categoryId: categoryOne.id,
      isRecurring: true,
    }

    const recurrence = { recurringType: 'daily', separationCount: 1 }
    // When
    const task = await repository.updateTask({
      id: taskOne.id,
      task: updatedTask,
      recurrence,
    })
    const [updated] = await repository.getTasks({ id: taskOne.id })
    // Then
    expect(task).toBe(true)
    expect(updated.isCompleted).toBe(taskOne.isCompleted)
    expect(updated.title).toBe(updatedTask.title)
    expect(updated.assignedUserId).toBe(updatedTask.assignedUserId)
    expect(updated.categoryId).toBe(updatedTask.categoryId)
    expect(updated.isRecurring).toBe(true)
    expect(updated.recurrence).toMatchObject(recurrence)
  })

  it('should throw error if updating recurring tasks with no provided recurrence pattern', async () => {
    // Given
    const updatedTask = {
      title: 'Task One Updated',
      assignedUserId: userTwo.id,
      categoryId: categoryTwo.id,
      isRecurring: true,
    }
    // When
    await expect(
      repository.updateTask({
        id: taskOne.id,
        task: updatedTask,
      })
    ).rejects.toThrowError(/missing task recurrence data/i)
    const [updated] = await repository.getTasks({ id: taskOne.id })
    // Then
    expect(updated.isCompleted).toBe(taskOne.isCompleted)
    expect(updated.title).not.toBe(updatedTask.title)
    expect(updated.assignedUserId).not.toBe(updatedTask.assignedUserId)
    expect(updated.categoryId).not.toBe(updatedTask.categoryId)
    expect(updated.isRecurring).toBe(false)
    expect(updated.recurrence).toBe(null)
  })

  it('should throw an error if there is no task id to update', async () => {
    // Given
    const taskId = 37

    // When
    await expect(
      repository.updateTask({
        id: taskId,
        task: { title: 'Update' },
      })
    ).rejects.toThrowError(/no result/i)
  })
})

describe('task completion', () => {
  it('should update task completion', async () => {
    // Given
    const updatedTask = {
      id: taskOne.id,
      isCompleted: true,
    }
    // When
    const task = await repository.updateTaskCompletion(updatedTask)
    // Then
    expect(task).toMatchObject({ ...taskOne, isCompleted: true })
  })

  it('should throw error if updating task completion fails', async () => {
    // Given
    const updatedTask = {
      id: taskOne.id + randomId(),
      isCompleted: true,
    }
    // When
    await expect(
      repository.updateTaskCompletion(updatedTask)
    ).rejects.toThrowError(/no result/i)

    // Then
    await expect(
      // @ts-expect-error
      repository.updateTaskCompletion({ ...updatedTask, isCompleted: 'cat' })
    ).rejects.toThrowError(/invalid input/i)
  })

  it('should add task completion data for recurring tasks', async () => {
    // Given
    const taskCompletion = {
      taskId: taskOne.id,
      instanceDate: new Date(),
      completedBy: userOne.id,
    }

    //  When
    const result = await repository.addToCompletedTasks(taskCompletion)

    // Then
    expect(result).toMatchObject({
      ...taskCompletion,
      id: expect.any(Number),
      completedAt: expect.any(Date),
    })
  })

  it('should throw error if fails adding task completion data for recurring tasks', async () => {
    // Given
    const taskCompletion = {
      taskId: taskOne.id,
      instanceDate: 'cat',
      completedBy: userOne.id,
    }

    //  Then
    await expect(
      // @ts-expect-error
      repository.addToCompletedTasks(taskCompletion)
    ).rejects.toThrowError(/invalid input/i)
  })

  it('should remove task completion data', async () => {
    // Given
    const taskCompletion = {
      taskId: taskOne.id,
      instanceDate: taskOneComplTwo.instanceDate,
    }
    // When
    const result = await repository.removeCompletedTasks(taskCompletion)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(Number(result.numDeletedRows)).toBe(1)
  })

  it('should not throw error if there was no removed task completion data', async () => {
    // Given
    const taskCompletion = {
      taskId: taskOne.id + randomId(),
      instanceDate: taskOneComplTwo.instanceDate,
    }
    // When
    const result = await repository.removeCompletedTasks(taskCompletion)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(Number(result.numDeletedRows)).toBe(0)
  })
})

describe('delete tasks', () => {
  it('should delete task by task id', async () => {
    // Given
    const taskId = taskFour.id

    // When
    const result = await repository.deleteTask(taskId)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(Number(result.numDeletedRows)).toBe(1)
  })
})
