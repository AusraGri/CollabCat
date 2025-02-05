import { authRepoContext, requestContext } from '@tests/utils/context'
import {  randomId } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase } from '@tests/utils/database'
import type { UserRepository } from '@server/repositories/userRepository'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockedRepo = (user?: any) => ({
  userRepository: {
    findAssignedUsersByTaskId: vi.fn(async () => user),
  } satisfies Partial<UserRepository>
})

describe('assignedUserByTaskId', () => {
const validInput = {taskId: randomId()}

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getAssignedUserByTaskId } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(getAssignedUserByTaskId(validInput)).rejects.toThrow(/unauthenticated/i)
})

it('should find assigned user info by task id', async () => {
  // ARRANGE
  const user = {id:  randomId(), username: 'Bob', email: 'some@email.com', picture: 'pic'}
  const repo = mockedRepo(user)
  const { getAssignedUserByTaskId } = createCaller(authRepoContext(repo))

  // ACT & ASSERT
  await expect(getAssignedUserByTaskId(validInput)).resolves.toMatchObject(user)
  expect(repo.userRepository.findAssignedUsersByTaskId).toBeCalledWith(validInput.taskId)
})

it('should return undefined if no user was found', async () => {
  // ARRANGE
  const repo = mockedRepo(undefined)
  const { getAssignedUserByTaskId } = createCaller(authRepoContext(repo))

  // ACT & ASSERT
  await expect(getAssignedUserByTaskId(validInput)).resolves.toBeUndefined()
  expect(repo.userRepository.findAssignedUsersByTaskId).toBeCalledWith(validInput.taskId)
})

})
