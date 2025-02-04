import {
  requestContext,
  authRepoContext,
} from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { TasksRepository } from '@server/repositories/tasksRepository'
import type { TaskData } from '@server/entities/tasks'
import {fakeAuthUser, fakeTaskData } from '@server/entities/tests/fakes'
import { setDateToUTCmidnight } from '@server/controllers/utility/helpers'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (tasks?: any[]) => ({
  tasksRepository: {
    getPersonalTasksDue: vi.fn(async () => tasks || [] as TaskData[]),
  } satisfies Partial<TasksRepository>,
})

const tasks = [fakeTaskData()]

const authUser = fakeAuthUser()
const validInput = { date: new Date()}

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
  const { getDuePersonalTasks } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(getDuePersonalTasks(validInput)).rejects.toThrow(/unauthenticated/i)
})

it('should return personal due tasks on the given date', async () => {
  const repo = mockRepo(tasks)
  const { getDuePersonalTasks } = createCaller(
    authRepoContext(repo, authUser)
  )
  // When (ACT)
  const taskResponse = await getDuePersonalTasks(validInput)
  // Then (ASSERT)
  expect(taskResponse).toMatchObject(tasks)
  expect(setDateToUTCmidnight).toHaveBeenCalledOnce()
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(validInput.date)
  expect(repo.tasksRepository.getPersonalTasksDue).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.getPersonalTasksDue).toHaveBeenCalledWith(
    validInput.date,
    authUser.id
  )
})

it('should return personal due tasks as empty array on the given date if no task were found', async () => {
  const repo = mockRepo()
  const { getDuePersonalTasks } = createCaller(
    authRepoContext(repo, authUser)
  )
  // When (ACT)
  const taskResponse = await getDuePersonalTasks(validInput)
  // Then (ASSERT)
  expect(taskResponse).toMatchObject([])
  expect(setDateToUTCmidnight).toHaveBeenCalledOnce()
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(validInput.date)
  expect(repo.tasksRepository.getPersonalTasksDue).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.getPersonalTasksDue).toHaveBeenCalledWith(
    validInput.date,
    authUser.id
  )
})

