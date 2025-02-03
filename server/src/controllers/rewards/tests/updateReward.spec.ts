import { authRepoContext, requestContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { RewardsRepository } from '@server/repositories/rewardsRepository'
import type { PublicReward } from '@server/entities/rewards'
import { fakeAuthUser, fakeReward, randomId } from '@server/entities/tests/fakes'
import rewardsRouter from '..'

const createCaller = createCallerFactory(rewardsRouter)
const db = await wrapInRollbacks(createTestDatabase())
const mockRepo = (reward?: Partial<PublicReward>) => ({
  rewardsRepository: {
    updateReward: vi.fn(async () => {
      if (!reward) throw new Error('failed to update')
      return reward as PublicReward
    }),
  } satisfies Partial<RewardsRepository>,
})

const authUser = fakeAuthUser()

const validInput = {
    id: randomId()
}

beforeEach(() => {
  vi.clearAllMocks()
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { updateReward } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(updateReward(validInput)).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo()
  const input = { id: 'cat' }
  const inputTwo = undefined
  const inputThree = { id: 34, cost: 'cat', amount: 'cat' }
  const inputFour = { id: 1, anything: 'any' }
  const { updateReward } = createCaller(authRepoContext(repo))

  // ACT & ASSERT
  // @ts-expect-error
  await expect(updateReward(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(updateReward(inputTwo)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(updateReward(inputThree)).rejects.toThrowError(
    /invalid_type/i
  )
  await expect(updateReward(inputFour)).rejects.toThrowError(
    /unrecognized_keys/i
  )
})

it('should throw error if failed to update', async () => {
  // ARRANGE
  const repo = mockRepo()
  const { updateReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(updateReward(validInput)).rejects.toThrowError(/failed/i)

  expect(repo.rewardsRepository.updateReward).toHaveBeenCalledWith({ id: validInput.id, reward: {} })
})

it('should update reward', async () => {
  // ARRANGE
  const reward = fakeReward({ id: validInput.id, amount: 5, groupId: 3, targetUserIds: [1, 2, 3, 4] })
  const repo = mockRepo(reward)
  // how to solve this error?
  // @ts-ignore
  const {createdByUserId, id, ...rewardUpdatable} = reward
  const { updateReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(updateReward({id, ...rewardUpdatable})).resolves.toMatchObject(reward)

  expect(repo.rewardsRepository.updateReward).toHaveBeenCalledWith({ 
    id: validInput.id,
    reward: {...rewardUpdatable}
  })
})