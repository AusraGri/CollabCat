import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { type PointsRepository } from '@server/repositories/pointsRepository'
import pointsRouter from '..'

const createCaller = createCallerFactory(pointsRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (points?: any,) => ({
  pointsRepository: {
    createPoints: vi.fn(async () => {
        if(!points) throw new Error('failed to create')
        return points
    }),
  } satisfies Partial<PointsRepository>,
})

const userPoints = {
  userId: 1,
  groupId: null,
  points: 0,
}

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { createPoints } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(createPoints({})).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo()
  const input = { groupId: 'cat'}
  const inputTwo = undefined
  const inputThreeValid= {anything: 'any'}
  const { createPoints } = createCaller(authRepoContext(repo))

  // ACT & ASSERT

  // @ts-expect-error
  await expect(createPoints(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(createPoints(inputTwo)).rejects.toThrowError(
    /invalid_type/i
  )
  // @ts-expect-error
  await expect(createPoints(inputThreeValid)).rejects.toThrowError(/unrecognized_keys/i)

})

it('should throw error if failed to create points', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo()
  const { createPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(createPoints({})).rejects.toThrowError(/failed/i)

  expect(repo.pointsRepository.createPoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId: undefined,
    points: 0
  })

  await expect(repo.pointsRepository.createPoints()).rejects.toThrowError()

})

it('should create user points', async () => {
  // ARRANGE

  const authUser = fakeAuthUser()
  const userPointsData = {...userPoints, userId: authUser.id }
  const repo = mockRepo(userPointsData)
  const { createPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(createPoints({})).resolves.toMatchObject(userPointsData)

  expect(repo.pointsRepository.createPoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId: undefined,
    points: 0
  })

  await expect(repo.pointsRepository.createPoints()).resolves.toMatchObject(userPointsData)

})

it('should create user points for group', async () => {
  // ARRANGE
 const groupId = 123
  const authUser = fakeAuthUser()
  const userPointsData = {...userPoints, userId: authUser.id, groupId }
  const repo = mockRepo(userPointsData)
  const { createPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(createPoints({groupId})).resolves.toMatchObject(userPointsData)

  expect(repo.pointsRepository.createPoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId,
    points: 0
  })

  await expect(repo.pointsRepository.createPoints()).resolves.toMatchObject(userPointsData)

})
