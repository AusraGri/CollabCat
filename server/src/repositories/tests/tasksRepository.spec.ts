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
    completed: true,
    importance: 'High',
    deadline: new Date(2024, 0, 1),
    title: 'Task One'

  }),
  fakeTask({
    createdByUserId: userTwo.id,
    assignedUserId: userThree.id,
    groupId: groupTwo.id,
    categoryId: categoryTwo.id,
    deadline: new Date(2023, 0, 1),
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
    const [task] = await repository.getTasks({completed: true})

    // Then
    expect(task).toMatchObject({
      ...taskOne
    })
  })

  it('should get tasks by deadline, with the most current task first', async () => {

    // When
    const tasks = await repository.getTasks({deadline: new Date()})

    // Then
    expect(tasks).toHaveLength(2)
    expect (tasks[0]).toMatchObject({
      ...taskOne
    })
    expect (tasks[1]).toMatchObject({
      ...taskTwo
    })
  })

  it('should get zero tasks id deadline is set behind any deadline', async () => {

    // When
    const tasks = await repository.getTasks({deadline: new Date(2010, 0, 1)})

    // Then
    expect(tasks).toHaveLength(0)

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
    expect(task.completed).toBe(taskOne.completed)
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