import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeTaskData } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { setDateToUTCmidnight } from '@server/controllers/utility/helpers'
import type { TasksRepository } from '@server/repositories/tasksRepository'
import type { TaskData } from '@server/entities/tasks'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (param: { updated: boolean; tasks: any[] }) => ({
  tasksRepository: {
    updateTask: vi.fn(async () => {
      if (!param.updated) throw new Error('failed to update task')
      return param.updated
    }),
    getTasks: vi.fn(async () => param.tasks || ([] as TaskData[])),
  } satisfies Partial<TasksRepository>,
})

const task = fakeTaskData()
const taskUpdatable = {
  id: task.id,
  task: {
    title: 'My New Task',
    startDate: new Date(),
    endDate: new Date(),
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mock('@server/controllers/utility/helpers', () => ({
    setDateToUTCmidnight: vi.fn((date: Date) => date),
  }))
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { updateTask } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(updateTask(taskUpdatable)).rejects.toThrow(/unauthenticated/i)
})

it('should update provided task values', async () => {
  // ARRANGE
  const repo = mockRepo({ tasks: [task], updated: true })
  const { updateTask } = createCaller(authRepoContext(repo))

  // ACT
  const taskReturned = await updateTask(taskUpdatable)
  // ASSERT
  expect(taskReturned).toMatchObject(task)
  expect(setDateToUTCmidnight).toHaveBeenCalledTimes(2)
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(
    taskUpdatable.task.startDate
  )
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(taskUpdatable.task.endDate)
  expect(repo.tasksRepository.updateTask).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.updateTask).toHaveBeenCalledWith(taskUpdatable)
})

it('should update provided task values and update recurrence', async () => {
  // ARRANGE
  const repo = mockRepo({ tasks: [task], updated: true })
  const { updateTask } = createCaller(authRepoContext(repo))
  const updatable = {
    ...taskUpdatable,
    recurrence: { recurringType: 'daily', separationCount: 2 },
  }

  // ACT
  const taskReturned = await updateTask(updatable)
  // ASSERT
  expect(taskReturned).toMatchObject(task)
  expect(setDateToUTCmidnight).toHaveBeenCalledTimes(2)
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(
    taskUpdatable.task.startDate
  )
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(taskUpdatable.task.endDate)
  expect(repo.tasksRepository.updateTask).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.updateTask).toHaveBeenCalledWith(updatable)
})

it('should throw error if update fails', async () => {
  // ARRANGE
  const repo = mockRepo({ tasks: [task], updated: false })
  const { updateTask } = createCaller(authRepoContext(repo))

  // ACT & ASSERT
  await expect(updateTask(taskUpdatable)).rejects.toThrowError(/failed/i)
  expect(setDateToUTCmidnight).toHaveBeenCalledTimes(2)
  expect(repo.tasksRepository.updateTask).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.updateTask).toHaveBeenCalledWith(taskUpdatable)
  await expect(repo.tasksRepository.updateTask()).rejects.toThrowError(
    /failed/i
  )
})
