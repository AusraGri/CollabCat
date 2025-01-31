import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { type PointsRepository } from '@server/repositories/pointsRepository'
import pointsRouter from '..'

const createCaller = createCallerFactory(pointsRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (userPoints?: any,) => ({
  pointsRepository: {
    getPoints: vi.fn(async () => userPoints || undefined),
  } satisfies Partial<PointsRepository>,
})

const userPoints = {
    userId: 1,
    groupId: null,
    points: 55,
  }


it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getUserPoints } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(getUserPoints({})).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo()
  const input = { groupId: 'cat'}
  const inputTwo = undefined
  const inputThreeValid= {anything: 'any'}
  const { getUserPoints } = createCaller(authRepoContext(repo))

  // ACT & ASSERT

  // @ts-expect-error
  await expect(getUserPoints(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(getUserPoints(inputTwo)).rejects.toThrowError(
    /invalid_type/i
  )
  // @ts-expect-error
  await expect(getUserPoints(inputThreeValid)).rejects.toThrowError(/unrecognized_keys/i)

})

it('should return undefined if no points found', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo()
  const { getUserPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(getUserPoints({})).resolves.toEqual(undefined)

  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
  })

  await expect(repo.pointsRepository.getPoints()).resolves.not.toThrowError();

})

it('should return user points', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo(userPoints)
  const { getUserPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(getUserPoints({})).resolves.toMatchObject(userPoints)

  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
  })

})

it('should return user group points if groupId is provided', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo(userPoints)
  const groupId = 234
  const { getUserPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(getUserPoints({groupId})).resolves.toMatchObject(userPoints)

  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId
  })

})