import {
  requestContext,
  authGroupRepoContext,
} from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { TasksRepository } from '@server/repositories/tasksRepository'
import type { TaskData } from '@server/entities/tasks'
import { fakeAuthGroup, fakeTaskData } from '@server/entities/tests/fakes'
import { setDateToUTCmidnight } from '@server/controllers/utility/helpers'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (tasks?: any[]) => ({
  tasksRepository: {
    getGroupTasksDue: vi.fn(async () => tasks || [] as TaskData[]),
  } satisfies Partial<TasksRepository>,
})

const tasks = [fakeTaskData()]

const authGroup = fakeAuthGroup()
const validInput = { date: new Date(), groupId: authGroup.groupId }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mock('@server/utils/isTaskDue', () => ({
    default: vi.fn((task: any) => task),
  }))
  vi.mock('@server/controllers/utility/helpers', () => ({
    setDateToUTCmidnight: vi.fn((date: Date) => date),
  }))
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getDueGroupTasks } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(getDueGroupTasks(validInput)).rejects.toThrow(/unauthenticated/i)
})

it('should return due tasks for the group on the given date', async () => {
  const repo = mockRepo(tasks)
  const { getDueGroupTasks } = createCaller(
    authGroupRepoContext(repo, undefined, authGroup)
  )
  // When (ACT)
  const taskResponse = await getDueGroupTasks(validInput)
  // Then (ASSERT)
  expect(taskResponse).toMatchObject(tasks)
  expect(setDateToUTCmidnight).toHaveBeenCalledOnce()
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(validInput.date)
  expect(repo.tasksRepository.getGroupTasksDue).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.getGroupTasksDue).toHaveBeenCalledWith({
    date: expect.any(Date),
    groupId: authGroup.groupId
  })
})

it('should return empty array if no due tasks found for the given date', async () => {
  const repo = mockRepo()
  const { getDueGroupTasks } = createCaller(
    authGroupRepoContext(repo, undefined, authGroup)
  )
  // When (ACT)
  const taskResponse = await getDueGroupTasks(validInput)
  // Then (ASSERT)
  expect(taskResponse).toMatchObject([])
  expect(setDateToUTCmidnight).toHaveBeenCalledOnce()
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(validInput.date)
  expect(repo.tasksRepository.getGroupTasksDue).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.getGroupTasksDue).toHaveBeenCalledWith({
    date: expect.any(Date),
    groupId: authGroup.groupId
  })
})

it('should return due tasks for the group on the given date and by user id', async () => {
  const repo = mockRepo(tasks)
  const { getDueGroupTasks } = createCaller(
    authGroupRepoContext(repo, undefined, authGroup)
  )
  const userId = 1
  // When (ACT)
  const taskResponse = await getDueGroupTasks({...validInput, userId})
  // Then (ASSERT)
  expect(taskResponse).toMatchObject(tasks)
  expect(setDateToUTCmidnight).toHaveBeenCalledOnce()
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(validInput.date)
  expect(repo.tasksRepository.getGroupTasksDue).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.getGroupTasksDue).toHaveBeenCalledWith({
    date: expect.any(Date),
    groupId: authGroup.groupId,
    userId
  })
})