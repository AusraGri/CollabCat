import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeAuthUser, fakeTask, randomId } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { setDateToUTCmidnight } from '@server/controllers/utility/helpers'
import type { TasksRepository } from '@server/repositories/tasksRepository'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (task: any) => ({
  tasksRepository: {
    createTask: vi.fn(async () => {
      if (!task) throw new Error('failed to create task')
      return task
    }),
  } satisfies Partial<TasksRepository>,
})

const newTask = {
  task: {
    title: 'My New Task',
    startDate: new Date(),
    endDate: new Date(),
  },
}

const authUser = fakeAuthUser()
const task = fakeTask({
  id: randomId(),
  startDate: newTask.task.startDate,
  title: newTask.task.title,
  createdByUserId: authUser.id,
  completedAt: null,
  assignedUserId: null,
  categoryId: null,
  groupId: null,
  points: null,
  startTime: null,
  isCompleted: false,
  isRecurring: false,
  recurrence: null,
  endDate: newTask.task.endDate,
  completed: [],
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mock('@server/controllers/utility/helpers', () => ({
    setDateToUTCmidnight: vi.fn((date: Date) => date),
  }))
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { createTask } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(createTask(newTask)).rejects.toThrow(/unauthenticated/i)
})

it('should create a persisted task without recurrence', async () => {
  // ARRANGE
  const repo = mockRepo(task)
  const { createTask } = createCaller(authRepoContext(repo, authUser))

  // ACT
  const taskReturned = await createTask(newTask)
  // ASSERT
  expect(taskReturned).toMatchObject(task)
  expect(setDateToUTCmidnight).toHaveBeenCalledTimes(2)
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(newTask.task.startDate)
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(newTask.task.endDate)
  expect(repo.tasksRepository.createTask).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.createTask).toHaveBeenCalledWith({
    task: { createdByUserId: authUser.id, ...newTask.task },
    recurrence: undefined,
  })
})
it('should create a persisted task without recurrence and dates (one time task)', async () => {
  // ARRANGE
  const repo = mockRepo(task)
  const { createTask } = createCaller(authRepoContext(repo, authUser))
  const createTaskInput = { task: { title: 'New one time task' } }

  // ACT
  const taskReturned = await createTask(createTaskInput)
  // ASSERT
  expect(taskReturned).toMatchObject(task)
  expect(setDateToUTCmidnight).not.toHaveBeenCalled()
  expect(repo.tasksRepository.createTask).toHaveBeenCalledOnce()
  expect(repo.tasksRepository.createTask).toHaveBeenCalledWith({
    task: {
      createdByUserId: authUser.id,
      startDate: undefined,
      endDate: undefined,
      ...createTaskInput.task,
    },
    recurrence: undefined,
  })
})

it('should create a persisted task with recurrence', async () => {
  // ARRANGE
  const repo = mockRepo(task)
  const recurrence = { recurringType: 'daily', separationCount: 3 }
  const { createTask } = createCaller(authRepoContext(repo, authUser))

  // ACT
  const taskReturned = await createTask({ ...newTask, recurrence })
  // ASSERT
  expect(taskReturned).toMatchObject(task)
  expect(repo.tasksRepository.createTask).toHaveBeenCalledWith({
    task: { createdByUserId: authUser.id, ...newTask.task },
    recurrence,
  })

  expect(setDateToUTCmidnight).toHaveBeenCalledTimes(2)
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(newTask.task.startDate)
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(newTask.task.endDate)
})
