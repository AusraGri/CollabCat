import { createTestDatabase } from '@tests/utils/database'
import {
  fakeTask,
  fakeUser,
  fakeGroup,
  fakeCategory
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll} from '@tests/utils/records'
import { pick } from 'lodash-es'
import { tasksKeysPublic } from '@server/entities/tasks'
import { tasksRepository } from '../tasksRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = tasksRepository(db)

// An example of repository tests with a database.
const [userOne, userTwo, userThree] = await insertAll(db, 'user', [fakeUser(), fakeUser(), fakeUser()])
const [groupOne, groupTwo] = await insertAll(db, 'groups', [fakeGroup({createdByUserId: userOne.id}), fakeGroup({createdByUserId: userTwo.id})])
const [categoryOne, categoryTwo] = await insertAll(db, 'categories', [fakeCategory({createdByUserId: userOne.id}), fakeCategory({createdByUserId: userTwo.id})])
const [taskOne, taskTwo] = await insertAll(db, 'tasks', [
  fakeTask({
    createdByUserId: userOne.id,
    groupId: groupOne.id,
    categoryId: categoryOne.id,
    isCompleted: true,
    importance: 'High',
    title: 'Task One'

  }),
  fakeTask({
    createdByUserId: userTwo.id,
    assignedUserId: userThree.id,
    groupId: groupTwo.id,
    categoryId: categoryTwo.id,
  }),
])


describe('create', () => {
  it('should create a task', async () => {
    // Given
    const task = fakeTask({createdByUserId: userThree.id})

    // When
    const createdTask = await repository.create(task)

    // Then
    expect(createdTask).toMatchObject({
      id: expect.any(Number),
      ...pick(tasksKeysPublic),
      createdByUserId: userThree.id
    })
  })
})

describe('get', () => {
  it('should get a task by id', async () => {

    // When
    const [task] = await repository.getTasks({id: taskOne.id})

    // Then
    expect(task).toMatchObject({
      ...taskOne
    })
  })

  it('should get task by the user who created the task', async () => {

    // When
    const [task] = await repository.getTasks({createdByUserId: userTwo.id})

    // Then
    expect(task).toMatchObject({
      ...taskTwo
    })
  })

  it('should get task by the assigned user to the task', async () => {

    // When
    const [task] = await repository.getTasks({assignedUserId: userThree.id})

    // Then
    expect(task).toMatchObject({
      ...taskTwo
    })
  })

  it('should get task by the category id', async () => {

    // When
    const [task] = await repository.getTasks({categoryId: categoryOne.id})

    // Then
    expect(task).toMatchObject({
      ...taskOne
    })
  })

  it('should get task by completed status', async () => {

    // When
    const [task] = await repository.getTasks({isCompleted: true})

    // Then
    expect(task).toMatchObject({
      ...taskOne
    })
  })


  it('should get tasks by title', async () => {

    // When
    const tasks = await repository.getTasks({title: 'task'})


    // Then
    expect(tasks).toHaveLength(1)

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
    const task = await repository.update({id: taskOne.id, task: updatedTask})

    // Then
    expect(task.isCompleted).toBe(taskOne.isCompleted)
    expect(task.title).toBe(updatedTask.title)
    expect(task.assignedUserId).toBe(updatedTask.assignedUserId)
    expect(task.categoryId).toBe(updatedTask.categoryId)

  })

  it('should throw an error if there is no task id to update', async () => {
    // Given
    const taskId = 456

    // When
    await expect(repository.update({ id: taskId, task: { title: 'Update' } })).rejects.toThrowError()

  })
})