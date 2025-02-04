import {  requestContext, authRepoContext } from '@tests/utils/context'
import { fakeTaskData} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { TaskData } from '@server/entities/tasks'
import type { TasksRepository } from '@server/repositories/tasksRepository'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (tasks?: any[]) => ({
  tasksRepository: {
    getTasks: vi.fn(async () => tasks || [] as TaskData[] ),
  } satisfies Partial<TasksRepository>,
})


const tasks = [
  fakeTaskData(),
   fakeTaskData(),
   fakeTaskData()
  ]


it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getTasks } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(getTasks({id: 1})).rejects.toThrow(/unauthenticated/i)
})

it('should return a task by id', async () => {
  const firstTask = tasks[0]
  const repo = mockRepo([firstTask])
  const {id} = firstTask
  const { getTasks } = createCaller(authRepoContext(repo))
  // When (ACT)
  const [taskResponse] = await getTasks({id})
  // Then (ASSERT)
  expect(taskResponse).toMatchObject(firstTask)
  expect(repo.tasksRepository.getTasks).toHaveBeenCalledWith({id})
})

it('should return [] if the task does not exist', async () => {
  const repo = mockRepo()
  const { getTasks } = createCaller(authRepoContext(repo))
  const nonExistentId = 1

  // When (ACT)
  await expect(getTasks({ id: nonExistentId })).resolves.toEqual([])

  expect(repo.tasksRepository.getTasks).toHaveBeenCalledWith({id: nonExistentId})
})
