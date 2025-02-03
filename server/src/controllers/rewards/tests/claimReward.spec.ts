import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { type PointsRepository } from '@server/repositories/pointsRepository'
import type { PointsPublic } from '@server/entities/points'
import type { PublicReward } from '@server/entities/rewards'
import type { RewardsRepository } from '@server/repositories/rewardsRepository'
import rewardsRouter from '..'

const createCaller = createCallerFactory(rewardsRouter)
const db = await wrapInRollbacks(createTestDatabase())
const mockRepo = (data: {
  reward?: Partial<PublicReward>
  points?: Partial<PointsPublic>
  claimed?: boolean
}) => ({
  pointsRepository: {
    getPoints: vi.fn(async () => (data.points as PointsPublic) || undefined),
  } satisfies Partial<PointsRepository>,
  rewardsRepository: {
    getRewards: vi.fn(
      async () => (data.reward ? [data.reward] : []) as PublicReward[]
    ),
    claimReward: vi.fn(async () => {
      if (!data.claimed) throw new Error('failed to claim')

      return data.claimed
    }),
  } satisfies Partial<RewardsRepository>,
})

const validInput = { rewardId: 1, groupId: 1 }

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { claimReward } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(claimReward(validInput)).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo({})
  const input = { groupId: 'cat' }
  const inputTwo = undefined
  const inputThree = { anything: 'any' }
  const inputFour = { rewardId: 'cat' }
  const { claimReward } = createCaller(authRepoContext(repo))

  // ACT & ASSERT

  // @ts-expect-error
  await expect(claimReward(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(claimReward(inputTwo)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(claimReward(inputThree)).rejects.toThrowError(
    /unrecognized_keys/i
  )
  // @ts-expect-error
  await expect(claimReward(inputFour)).rejects.toThrowError(/invalid_type/i)
})

it('should throw error if no reward was found', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo({})
  const { claimReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(claimReward(validInput)).rejects.toThrowError(/not found/i)

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({
    id: validInput.rewardId,
  })

  expect(repo.pointsRepository.getPoints).not.toHaveBeenCalled()
  expect(repo.rewardsRepository.claimReward).not.toHaveBeenCalled()
})

it('should throw error if reward has insufficient amount', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const reward = { amount: 0 }
  const repo = mockRepo({ reward })
  const { claimReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(claimReward(validInput)).rejects.toThrowError(/not sufficient/i)

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({
    id: validInput.rewardId,
  })

  expect(repo.pointsRepository.getPoints).not.toHaveBeenCalled()
  expect(repo.rewardsRepository.claimReward).not.toHaveBeenCalled()
})

it('should throw error if user has insufficient points to claim reward', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const reward = { amount: 3, cost: 20 }
  const points = { points: 10 }
  const repo = mockRepo({ reward, points })
  const { claimReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(claimReward(validInput)).rejects.toThrowError(/insufficient/i)

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({
    id: validInput.rewardId,
  })

  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId: validInput.groupId,
  })
  expect(repo.rewardsRepository.claimReward).not.toHaveBeenCalled()
})

it('should throw error if claiming reward failed', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const reward = { amount: 3, cost: 20 }
  const points = { points: 50 }
  const userId = authUser.id
  const { groupId, rewardId } = validInput
  const updatedPoints = 50 - 20
  const rewardAmount = 3 - 1
  const repo = mockRepo({ reward, points })
  const { claimReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(claimReward(validInput)).rejects.toThrowError(/failed/i)

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({
    id: rewardId,
  })

  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId,
    groupId,
  })
  expect(repo.rewardsRepository.claimReward).toHaveBeenCalledWith({
    userId,
    updatedPoints,
    rewardId,
    groupId,
    rewardAmount,
  })

  await expect(repo.rewardsRepository.claimReward()).rejects.toThrowError()
})

it('should throw error if user is not in reward target users', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const reward = { amount: 3, cost: 20, targetUserIds: [authUser.id + 1] }
  const points = { points: 50 }
  const { rewardId } = validInput
  const repo = mockRepo({ reward, points })
  const { claimReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(claimReward(validInput)).rejects.toThrowError(/unauthorized/i)

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({
    id: rewardId,
  })

  expect(repo.pointsRepository.getPoints).not.toHaveBeenCalled()
  expect(repo.rewardsRepository.claimReward).not.toHaveBeenCalled()
})

it('should successfully claim group reward', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const reward = { amount: 3, cost: 20 }
  const points = { points: 50 }
  const userId = authUser.id
  const { groupId, rewardId } = validInput
  const updatedPoints = 50 - 20
  const rewardAmount = 3 - 1
  const repo = mockRepo({ reward, points, claimed: true })
  const { claimReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(claimReward(validInput)).resolves.toEqual(true)

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({
    id: rewardId,
  })

  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId,
    groupId,
  })
  expect(repo.rewardsRepository.claimReward).toHaveBeenCalledWith({
    userId,
    updatedPoints,
    rewardId,
    groupId,
    rewardAmount,
  })

  await expect(repo.rewardsRepository.claimReward()).resolves.toEqual(true)
})

it('should successfully claim personal reward', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const reward = { amount: 3, cost: 20 }
  const points = { points: 50 }
  const userId = authUser.id
  const { rewardId } = validInput
  const updatedPoints = 50 - 20
  const rewardAmount = 3 - 1
  const repo = mockRepo({ reward, points, claimed: true })
  const { claimReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(claimReward({ rewardId })).resolves.toEqual(true)

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({
    id: rewardId,
  })

  expect(repo.pointsRepository.getPoints).toHaveBeenCalledWith({
    userId,
  })
  expect(repo.rewardsRepository.claimReward).toHaveBeenCalledWith({
    userId,
    updatedPoints,
    rewardId,
    rewardAmount,
  })

  await expect(repo.rewardsRepository.claimReward()).resolves.toEqual(true)
})
