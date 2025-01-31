import {
  authRepoContext,
  requestContext,
} from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { setDateToUTCmidnight } from '@server/controllers/utility/helpers'
import { type PointsRepository } from '@server/repositories/pointsRepository'
import pointsRouter from '..'

const createCaller = createCallerFactory(pointsRouter)
const db = await wrapInRollbacks(createTestDatabase())

vi.mock('@server/controllers/utility/helpers', () => ({
  setDateToUTCmidnight: vi.fn((date: Date)=> date)
}))

const mockRepo = (pointClaim?: any) => ({
  pointsRepository: {
    getPointClaims: vi.fn(async () => pointClaim || undefined),
  } satisfies Partial<PointsRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { isUserClaimedPoints} = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
    isUserClaimedPoints({
      taskId: 1,
      taskInstanceDate: new Date(),
    })
  ).rejects.toThrow(/unauthenticated/i)
})

const claimedPoints = {
  id: 1,
  userId: 1,
  taskId: 1,
  claimedAt: new Date(),
  taskInstanceDate: new Date(),
}

const validInput = { taskId: 1, taskInstanceDate: new Date() }
const authUser = fakeAuthUser()


it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo()
  const input = { taskId: 'cat', taskInstanceDate: 'cat' }
  const inputTwo = { taskId: 1, taskInstanceDate: 'cat' }
  const inputThree = { taskInstanceDate: 'cat' }
  const inputFour = {}
  const inputFive = {anything: 'any'}
  const { isUserClaimedPoints } = createCaller(authRepoContext(repo))

  // ACT & ASSERT

  // @ts-expect-error
  await expect(isUserClaimedPoints(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(isUserClaimedPoints(inputTwo)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(isUserClaimedPoints(inputThree)).rejects.toThrowError(
    /invalid_type/i
  )
  // @ts-expect-error
  await expect(isUserClaimedPoints(inputFour)).rejects.toThrowError(
    /invalid_type/i
  )
  // @ts-expect-error
  await expect(isUserClaimedPoints(inputFive)).rejects.toThrowError(
    /invalid_type/i
  )
})

it('should return true if user has claimed points', async () => {
  // ARRANGE
  const repo = mockRepo(claimedPoints)
  const { isUserClaimedPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT
  await expect(isUserClaimedPoints(validInput)).resolves.toEqual(true)
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(validInput.taskInstanceDate)
  expect(repo.pointsRepository.getPointClaims).toHaveBeenCalledWith({
    ...validInput,
    userId: authUser.id
  })
})

it('should return false if user has not claimed points', async () => {
  // ARRANGE
  const repo = mockRepo()
  const { isUserClaimedPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT
  await expect(isUserClaimedPoints(validInput)).resolves.toEqual(false)
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(validInput.taskInstanceDate)
  expect(repo.pointsRepository.getPointClaims).toHaveBeenCalledWith({
    ...validInput,
    userId: authUser.id
  })
})
