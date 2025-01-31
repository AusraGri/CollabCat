import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { type PointsRepository } from '@server/repositories/pointsRepository'
import pointsRouter from '..'

const createCaller = createCallerFactory(pointsRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (points?: any, alteredPoints?: any) => ({
  pointsRepository: {
    getPoints: vi.fn(async () => points || undefined),
    alterPoints: vi.fn(async () => {
      if (!alteredPoints) throw new Error('failed to update')
      return alteredPoints
    }),
  } satisfies Partial<PointsRepository>,
})

const validInput = {
  groupId: 1,
  action: '+',
  points: 20,
} as const

const userPoints = {
  userId: 1,
  createdAt: new Date(),
  groupId: null,
  points: 55,
}

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { alterPoints } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(alterPoints(validInput)).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo()
  const input = { groupId: 'cat', points: 'cat', action: '-' }
  const inputTwo = { points: 2, action: 'cat' }
  const inputThree = { groupId: 1, points: 5n, action: '-' }
  const inputFour = {}
  const { alterPoints } = createCaller(authRepoContext(repo))

  // ACT & ASSERT

  // @ts-expect-error
  await expect(alterPoints(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(alterPoints(inputTwo)).rejects.toThrowError(
    /invalid_enum_value/i
  )
  // @ts-expect-error
  await expect(alterPoints(inputThree)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(alterPoints(inputFour)).rejects.toThrowError(/invalid_type/i)
})

it('should throw error if user has no points', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo()
  const { alterPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT
  await expect(alterPoints(validInput)).rejects.toThrowError(/not found/i)
  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId: validInput.groupId,
  })
})

it('should throw error if failed to alter user points', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo(userPoints)
  const { alterPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT
  await expect(alterPoints(validInput)).rejects.toThrowError(/failed/i)
  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId: validInput.groupId,
  })
  expect(repo.pointsRepository.alterPoints).toHaveBeenCalledWith({
    ...validInput,
    userId: authUser.id,
  })

  await expect(repo.pointsRepository.alterPoints()).rejects.toThrowError()
})

it('should alter user group points', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo(userPoints, userPoints)
  const { alterPoints } = createCaller(authRepoContext(repo, authUser))
  const { createdAt, ...points } = userPoints

  // ACT & ASSERT
  await expect(alterPoints(validInput)).resolves.toMatchObject(points)
  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId: validInput.groupId,
  })
  expect(repo.pointsRepository.alterPoints).toHaveBeenCalledWith({
    ...validInput,
    userId: authUser.id,
  })
})

it('should alter user points', async () => {
  // ARRANGE
  const { groupId, ...input } = validInput
  const authUser = fakeAuthUser()
  const repo = mockRepo(userPoints, userPoints)
  const { alterPoints } = createCaller(authRepoContext(repo, authUser))
  const { createdAt, ...points } = userPoints

  // ACT & ASSERT
  await expect(alterPoints(input)).resolves.toMatchObject(points)
  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
  })
  expect(repo.pointsRepository.alterPoints).toHaveBeenCalledWith({
    ...input,
    userId: authUser.id,
  })
})

it('should set points to zero when subtracting points from the user, if the users current points are equal to the points being subtracted', async () => {
  // ARRANGE
  const input = {
    action: '-',
    points: 55,
  } as const
  const authUser = fakeAuthUser()
  const repo = mockRepo(userPoints, userPoints)
  const { alterPoints } = createCaller(authRepoContext(repo, authUser))
  const { createdAt, ...points } = userPoints

  // ACT & ASSERT
  await expect(alterPoints(input)).resolves.toMatchObject(points)
  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
  })
  expect(repo.pointsRepository.alterPoints).toHaveBeenCalledWith({
    action: '=',
    points: 0,
    userId: authUser.id,
  })
})

it('should set points to zero when subtracting points from the user, if the users current points are less than the points being subtracted. Avoid negative points.', async () => {
  // ARRANGE
  const input = {
    action: '-',
    points: 200,
  } as const
  const authUser = fakeAuthUser()
  const repo = mockRepo(userPoints, userPoints)
  const { alterPoints } = createCaller(authRepoContext(repo, authUser))
  const { createdAt, ...points } = userPoints

  // ACT & ASSERT
  await expect(alterPoints(input)).resolves.toMatchObject(points)
  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
  })
  expect(repo.pointsRepository.alterPoints).toHaveBeenCalledWith({
    action: '=',
    points: 0,
    userId: authUser.id,
  })
})
