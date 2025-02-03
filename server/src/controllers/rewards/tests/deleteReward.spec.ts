import { authRepoContext, requestContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { RewardsRepository } from '@server/repositories/rewardsRepository'
import type { DeleteResult } from 'kysely'
import rewardsRouter from '..'

const createCaller = createCallerFactory(rewardsRouter)
const db = await wrapInRollbacks(createTestDatabase())
const mockRepo = (
  bigInt: BigInt = 0n) => ({
  rewardsRepository: {
    deleteReward: vi.fn(async () => ({numDeletedRows: bigInt}) as DeleteResult,
  )} satisfies Partial<RewardsRepository>,
})

const validInput = {rewardId: 1}

beforeEach(()=> {
    vi.clearAllMocks()
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { deleteReward } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(deleteReward(validInput)).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo()
  const input = { rewardId: 'cat' }
  const inputTwo = undefined
  const inputThree = { rewardId: -34 }
  const inputFour = { anything: 'any' }
  const { deleteReward } = createCaller(authRepoContext(repo))

  // ACT & ASSERT
// @ts-expect-error
  await expect(deleteReward(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(deleteReward(inputTwo)).rejects.toThrowError(/invalid_type/i)
 
  await expect(deleteReward(inputThree)).rejects.toThrowError(/too_small/i)
  // @ts-expect-error
  await expect(deleteReward(inputFour)).rejects.toThrowError(/invalid_type/i)
})

it('should delete reward and return success message', async () => {
  // ARRANGE
  const repo = mockRepo(10n)
  const { deleteReward } = createCaller(authRepoContext(repo))
  const {rewardId} = validInput

  // ACT & ASSERT

  await expect(deleteReward(validInput)).resolves.toMatchObject({
    success: true,
    message: /deleted/i
  })

  expect(repo.rewardsRepository.deleteReward).toHaveBeenCalledWith(
    rewardId
  )

})

it('should delete reward and return message if no reward was found to delete', async () => {
  // ARRANGE
  const repo = mockRepo()
  const { deleteReward } = createCaller(authRepoContext(repo))
  const {rewardId} = validInput

  // ACT & ASSERT

  await expect(deleteReward(validInput)).resolves.toMatchObject({
    success: true,
    message: /not found/i
  })

  expect(repo.rewardsRepository.deleteReward).toHaveBeenCalledWith(
    rewardId
  )

})