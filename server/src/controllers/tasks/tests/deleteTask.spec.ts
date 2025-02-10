import { requestContext, authRepoContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { TasksRepository } from '@server/repositories/tasksRepository'
import type { DeleteResult } from 'kysely'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (bigInt: BigInt = 0n) => ({
  tasksRepository: {
    deleteTask: vi.fn(async () => ({ numDeletedRows: bigInt }) as DeleteResult),
  } satisfies Partial<TasksRepository>,
})

const taskId = 1

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { deleteTask } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(deleteTask({ taskId })).rejects.toThrow(/unauthenticated/i)
})

it('should return success message if there was deleted rows', async () => {
  const repo = mockRepo(5n)
  const { deleteTask } = createCaller(authRepoContext(repo))
  // When (ACT)
  const taskResponse = await deleteTask({ taskId })
  // Then (ASSERT)
  expect(taskResponse).toMatchObject({
    success: true,
    message: /successfully deleted/i,
  })
  expect(repo.tasksRepository.deleteTask).toHaveBeenCalledWith(taskId)
})

it('should return success message if there was no deleted rows', async () => {
  const repo = mockRepo()
  const { deleteTask } = createCaller(authRepoContext(repo))
  // When (ACT)
  const taskResponse = await deleteTask({ taskId })
  // Then (ASSERT)
  expect(taskResponse).toMatchObject({
    success: true,
    message: /not found/i,
  })
  expect(repo.tasksRepository.deleteTask).toHaveBeenCalledWith(taskId)
})
