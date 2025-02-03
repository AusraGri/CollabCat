import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { PublicReward } from '@server/entities/rewards'
import type { RewardsRepository } from '@server/repositories/rewardsRepository'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import type { GroupsPublic } from '@server/entities/groups'
import rewardsRouter from '..'

const createCaller = createCallerFactory(rewardsRouter)
const db = await wrapInRollbacks(createTestDatabase())
const mockRepo = (data: {
  reward?: Partial<PublicReward>
  group?: Partial<GroupsPublic>
}) => ({
  groupsRepository: {
    getGroup: vi.fn(
      async () => (data.group ? [data.group] : []) as GroupsPublic[]
    ),
  } satisfies Partial<GroupRepository>,
  rewardsRepository: {
    createReward: vi.fn(async () => (data.reward as PublicReward) || undefined),
  } satisfies Partial<RewardsRepository>,
})

const validInput = { amount: 1, cost: 5, title: 'New Reward', groupId: 1 }

beforeEach(() => {
  vi.clearAllMocks()
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { createReward } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(createReward(validInput)).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo({})
  const input = { title: 'ca', cost: 0 }
  const inputTwo = undefined
  const inputThree = { anything: 'any' }
  const inputFour = { cost: 'cat', title: 'cat' }
  const inputFive = { cost: 'cat', title: 1 }
  const { createReward } = createCaller(authRepoContext(repo))

  // ACT & ASSERT

  await expect(createReward(input)).rejects.toThrowError(/too_small/i)
  // @ts-expect-error
  await expect(createReward(inputTwo)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(createReward(inputThree)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(createReward(inputFour)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(createReward(inputFive)).rejects.toThrowError(/invalid_type/i)
})

it('should throw error if no group was found if new reward is for the group', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo({})
  const { createReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(createReward(validInput)).rejects.toThrowError(/not found/i)

  expect(repo.groupsRepository.getGroup).toHaveBeenCalledWith({
    id: validInput.groupId,
  })

  expect(repo.rewardsRepository.createReward).not.toHaveBeenCalled()
})

it('should create new reward for a group', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const reward = {
    ...validInput,
    createdByUserId: authUser.id,
    id: 1,
    targetUserIds: null,
  }
  const group = { id: 2 }
  const { id, ...createRewardData } = reward
  const repo = mockRepo({ reward, group })
  const { createReward } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(createReward(validInput)).resolves.toMatchObject({
    ...reward,
  })

  expect(repo.groupsRepository.getGroup).toHaveBeenCalledWith({
    id: validInput.groupId,
  })

  expect(repo.rewardsRepository.createReward).toHaveBeenCalledWith({
    ...createRewardData,
    targetUserIds: undefined,
  })
})

it('should create new personal reward', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const reward = {
    cost: 5,
    title: 'Personal Reward',
    groupId: null,
    createdByUserId: authUser.id,
    id: 1,
    targetUserIds: null,
    amount: null,
  }
  const group = { id: 2 }
  const repo = mockRepo({ reward, group })
  const { createReward } = createCaller(authRepoContext(repo, authUser))
  const { groupId, ...input } = validInput

  // ACT & ASSERT

  await expect(createReward({ ...input })).resolves.toMatchObject({
    ...reward,
  })

  expect(repo.groupsRepository.getGroup).not.toHaveBeenCalled()

  expect(repo.rewardsRepository.createReward).toHaveBeenCalledWith({
    ...input,
    createdByUserId: authUser.id,
    targetUserIds: undefined,
  })
})
