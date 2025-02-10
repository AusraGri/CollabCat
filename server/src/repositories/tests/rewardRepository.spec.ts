import { createTestDatabase } from '@tests/utils/database'
import {
  fakeGroup,
  fakePoints,
  fakeReward,
  fakeUser,
  randomId,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { DeleteResult, type Insertable } from 'kysely'
import type { Rewards } from '@server/database'
import { rewardsRepository } from '../rewardsRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = rewardsRepository(db)

const [userOne, userTwo] = await insertAll(db, 'user', [fakeUser(), fakeUser()])
const [groupOne] = await insertAll(db, 'groups', [
  fakeGroup({ createdByUserId: userOne.id }),
])
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [pointsOne, pointsTwo] = await insertAll(db, 'points', [
  fakePoints({ userId: userOne.id, points: 10, groupId: null }),
  fakePoints({ userId: userOne.id, points: 10, groupId: groupOne.id }),
])
const [rewardOne, rewardTwo, rewardThree] = await insertAll(db, 'rewards', [
  fakeReward({ createdByUserId: userOne.id, cost: 5, amount: 1 }),
  fakeReward({ createdByUserId: userOne.id, groupId: groupOne.id, cost: 100 }),
  fakeReward({ createdByUserId: userOne.id, targetUserIds: [userTwo.id] }),
])

describe('create reward', () => {
  it('should create new reward', async () => {
    // Given
    const newReward = fakeReward({ createdByUserId: userOne.id })

    // When
    const result = await repository.createReward(newReward)

    // Then
    expect(result).toEqual({
      ...newReward,
      id: expect.any(Number),
    })
  })

  it('should create new reward for group', async () => {
    // Given
    const newReward = fakeReward({
      createdByUserId: userOne.id,
      groupId: groupOne.id,
    }) as Insertable<Rewards>

    // When
    const result = await repository.createReward(newReward)

    // Then
    expect(result).toEqual({
      ...newReward,
      id: expect.any(Number),
    })
  })

  it('should throw error if createdByUserId is invalid', async () => {
    // Given
    const newReward = fakeReward({
      createdByUserId: userOne.id + randomId(),
      groupId: groupOne.id,
    })

    // Then
    await expect(repository.createReward(newReward)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })

  it('should throw error if group id is invalid', async () => {
    // Given
    const newReward = fakeReward({
      createdByUserId: userOne.id,
      groupId: groupOne.id + randomId(),
    })

    // Then
    await expect(repository.createReward(newReward)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })

  it('should throw error if input is invalid', async () => {
    // Given
    const newReward = fakeReward({
      createdByUserId: userOne.id,
      groupId: groupOne.id,
      anything: 'any',
    })

    // Then
    await expect(repository.createReward(newReward)).rejects.toThrowError(
      /does not exist/i
    )
  })
})

describe('get rewards', () => {
  it('should get rewards by reward id', async () => {
    // Given
    const { id } = rewardOne

    // When
    const result = await repository.getRewards({ id })

    // Then
    expect(result).toHaveLength(1)
    expect(result).toEqual([rewardOne])
  })

  it('should get rewards by group id', async () => {
    // Given
    const { id } = groupOne

    // When
    const result = await repository.getRewards({ groupId: id })

    // Then
    expect(result).toHaveLength(1)
    expect(result).toEqual([rewardTwo])
  })

  it('should get rewards by user id who created it', async () => {
    // Given
    const { id } = userOne

    // When
    const result = await repository.getRewards({ createdByUserId: id })

    // Then
    expect(result).toHaveLength(2)
    expect(result).toEqual([rewardOne, rewardThree])
  })

  it('should get rewards by user id who created it (excluding group rewards)', async () => {
    // Given
    const { id } = userOne

    // When
    const result = await repository.getRewards({ createdByUserId: id })

    // Then
    expect(result).toHaveLength(2)
    expect(result).toEqual([rewardOne, rewardThree])
  })

  it('should return [] if no query options provided', async () => {
    // When
    const result = await repository.getRewards({})

    // Then
    expect(result).toHaveLength(0)
    expect(result).toEqual([])
  })
})

describe('delete reward', () => {
  it('should delete reward by reward id', async () => {
    // Given
    const { id } = rewardThree

    // When
    const result = await repository.deleteReward(id)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toEqual(1n)
  })

  it('should not throw error if reward id non existent', async () => {
    // Given
    const id = randomId()

    // When
    const result = await repository.deleteReward(id)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toBeFalsy()
    expect(result.numDeletedRows).toEqual(0n)
  })
})

describe('update reward', () => {
  it(' should update reward', async () => {
    // Given
    const { id } = rewardThree
    const newRewardValues = fakeReward({
      createdByUserId: userTwo.id,
      amount: 4,
    }) as Insertable<Rewards>

    // When
    const result = await repository.updateReward({
      id,
      reward: newRewardValues,
    })

    // Then
    expect(result).toMatchObject({
      id,
      ...newRewardValues,
    })
  })

  it(' should throw error if update input is invalid: reward id', async () => {
    // Given
    const id = randomId()
    const newRewardValues = fakeReward({
      createdByUserId: userTwo.id,
      amount: 4,
    })

    // Then
    await expect(
      repository.updateReward({
        id,
        reward: newRewardValues,
      })
    ).rejects.toThrowError(/no result/i)
  })

  it(' should throw error if update input is invalid: reward amount type', async () => {
    // Given
    const { id } = rewardThree
    const newRewardValues = fakeReward({
      createdByUserId: userTwo.id,
      // @ts-expect-error
      amount: 'cat',
    })

    // Then
    await expect(
      repository.updateReward({
        id,
        reward: newRewardValues,
      })
    ).rejects.toThrowError(/invalid input/i)
  })
})

describe('reward claims', () => {
  it('should add reward claim data', async () => {
    // Given
    const claimData = { rewardId: rewardOne.id, userId: userOne.id }

    // When
    const result = await repository.addRewardClaim(claimData)

    // Then
    expect(result).toMatchObject({
      id: expect.any(Number),
      ...claimData,
      claimedAt: expect.any(Date),
    })
  })

  it('should throw error if reward claim data is invalid: user id', async () => {
    // Given
    const claimData = { rewardId: rewardOne.id, userId: randomId() }

    // Then
    await expect(repository.addRewardClaim(claimData)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })

  it('should throw error if reward claim data is invalid: reward id', async () => {
    // Given
    const claimData = { rewardId: randomId(), userId: userOne.id }

    // Then
    await expect(repository.addRewardClaim(claimData)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })

  it('should proceed with reward claim for personal reward and update user points', async () => {
    // Given
    const claimData = {
      rewardId: rewardOne.id,
      userId: userOne.id,
      updatedPoints: 5,
    }

    // When
    const result = await repository.claimReward(claimData)

    // Then
    expect(result).toEqual({
      rewardId: rewardOne.id,
      userId: userOne.id,
      id: expect.any(Number),
      claimedAt: expect.any(Date),
    })

    const updatedPoints = await db
      .selectFrom('points')
      .select(['points'])
      .where('userId', '=', userOne.id)
      .where('groupId', 'is', null)
      .executeTakeFirstOrThrow()

    expect(updatedPoints.points).toEqual(claimData.updatedPoints)
  })

  it('should proceed with reward claim for group reward and update user group points', async () => {
    // Given
    const claimData = {
      rewardId: rewardOne.id,
      userId: userOne.id,
      updatedPoints: 5,
      groupId: groupOne.id,
    }

    // When
    const result = await repository.claimReward(claimData)

    // Then
    expect(result).toEqual({
      rewardId: rewardOne.id,
      userId: userOne.id,
      id: expect.any(Number),
      claimedAt: expect.any(Date),
    })

    const updatedPoints = await db
      .selectFrom('points')
      .select(['points'])
      .where('userId', '=', userOne.id)
      .where('groupId', '=', groupOne.id)
      .executeTakeFirstOrThrow()

    expect(updatedPoints.points).toEqual(claimData.updatedPoints)
  })

  it('should proceed with reward claim for group reward and update reward amount', async () => {
    // Given
    const claimData = {
      rewardId: rewardOne.id,
      userId: userOne.id,
      updatedPoints: 5,
      rewardAmount: 0,
    }

    // When
    const result = await repository.claimReward(claimData)

    // Then
    expect(result).toEqual({
      rewardId: rewardOne.id,
      userId: userOne.id,
      id: expect.any(Number),
      claimedAt: expect.any(Date),
    })

    const updatedPoints = await db
      .selectFrom('points')
      .select(['points'])
      .where('userId', '=', userOne.id)
      .where('groupId', 'is', null)
      .executeTakeFirstOrThrow()

    const updatedReward = await db
      .selectFrom('rewards')
      .select('rewards.amount')
      .where('rewards.id', '=', rewardOne.id)
      .executeTakeFirstOrThrow()

    expect(updatedPoints.points).toEqual(claimData.updatedPoints)
    expect(updatedReward.amount).toEqual(claimData.rewardAmount)
  })

  it('should throw error if reward id is invalid', async () => {
    // Given
    const claimData = {
      rewardId: randomId(),
      userId: userOne.id,
      updatedPoints: 5,
      rewardAmount: 0,
    }

    // Then
    await expect(repository.claimReward(claimData)).rejects.toThrowError(
      /foreign key constraint/i
    )

    const updatedPoints = await db
      .selectFrom('points')
      .select(['points'])
      .where('userId', '=', userOne.id)
      .where('groupId', 'is', null)
      .executeTakeFirstOrThrow()

    expect(updatedPoints.points).toEqual(pointsOne.points)
  })

  it('should throw error if user id is invalid', async () => {
    // Given
    const claimData = {
      rewardId: rewardOne.id,
      userId: randomId(),
      updatedPoints: 5,
      rewardAmount: 0,
    }

    // Then
    await expect(repository.claimReward(claimData)).rejects.toThrowError(
      /no result/i
    )

    const updatedPoints = await db
      .selectFrom('points')
      .select(['points'])
      .where('userId', '=', userOne.id)
      .where('groupId', 'is', null)
      .executeTakeFirstOrThrow()

    const updatedReward = await db
      .selectFrom('rewards')
      .select('rewards.amount')
      .where('rewards.id', '=', rewardOne.id)
      .executeTakeFirstOrThrow()

    expect(updatedReward.amount).toEqual(rewardOne.amount)
    expect(updatedPoints.points).toEqual(pointsOne.points)
  })
})
