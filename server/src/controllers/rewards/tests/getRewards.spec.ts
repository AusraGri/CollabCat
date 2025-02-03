import { authRepoContext, requestContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { RewardsRepository } from '@server/repositories/rewardsRepository'
import type { PublicReward } from '@server/entities/rewards'
import { fakeAuthUser, fakeReward } from '@server/entities/tests/fakes'
import rewardsRouter from '..'

const createCaller = createCallerFactory(rewardsRouter)
const db = await wrapInRollbacks(createTestDatabase())
const mockRepo = (reward?: Partial<PublicReward>) => ({
  rewardsRepository: {
    getRewards: vi.fn(async () => (reward ? [reward] : []) as PublicReward[]),
  } satisfies Partial<RewardsRepository>,
})

const authUser = fakeAuthUser()
const validInput = { groupId: 1 }

beforeEach(() => {
  vi.clearAllMocks()
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getRewards } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(getRewards(validInput)).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo()
  const input = { groupId: 'cat' }
  const inputTwo = undefined
  const inputThree = { rewardId: 34 }
  const inputFour = { anything: 'any' }
  const { getRewards } = createCaller(authRepoContext(repo))

  // ACT & ASSERT
  // @ts-expect-error
  await expect(getRewards(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(getRewards(inputTwo)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(getRewards(inputThree)).rejects.toThrowError(
    /unrecognized_keys/i
  )
  // @ts-expect-error
  await expect(getRewards(inputFour)).rejects.toThrowError(/unrecognized_keys/i)
})

it('should return empty array if no rewards were found', async () => {
  // ARRANGE
  const repo = mockRepo()
  const { getRewards } = createCaller(authRepoContext(repo, authUser))
  const { groupId } = validInput

  // ACT & ASSERT

  await expect(getRewards(validInput)).resolves.toMatchObject([])

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({ groupId })
})

it('should return rewards for group', async () => {
  // ARRANGE
  const reward = fakeReward({ id: 1 })
  const repo = mockRepo(reward)
  const { getRewards } = createCaller(authRepoContext(repo, authUser))
  const { groupId } = validInput

  // ACT & ASSERT

  await expect(getRewards(validInput)).resolves.toMatchObject([reward])

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({ groupId })
})

it('should return personal rewards', async () => {
  // ARRANGE
  const reward = fakeReward({ id: 1, createdByUserId: authUser.id })
  const repo = mockRepo(reward)
  const { getRewards } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(getRewards({})).resolves.toMatchObject([reward])

  expect(repo.rewardsRepository.getRewards).toHaveBeenCalledWith({
    createdByUserId: authUser.id,
  })
})
