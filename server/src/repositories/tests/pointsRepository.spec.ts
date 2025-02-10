import { createTestDatabase } from '@tests/utils/database'
import { DeleteResult } from 'kysely'
import {
  fakeUser,
  fakeGroup,
  randomId,
  fakeTask,
  fakePoints,
  fakePointClaim,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { pointsRepository } from '../pointsRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = pointsRepository(db)

const [userOne, userTwo] = await insertAll(db, 'user', [fakeUser(), fakeUser()])
const [groupOne] = await insertAll(db, 'groups', [
  fakeGroup({ createdByUserId: userOne.id }),
])
const [task] = await insertAll(
  db,
  'tasks',
  fakeTask({ createdByUserId: userOne.id })
)

const [pointsOne, pointsTwo] = await insertAll(db, 'points', [
  fakePoints({ userId: userOne.id, groupId: null }),
  fakePoints({ userId: userOne.id, groupId: groupOne.id }),
])
const [pointClaim] = await insertAll(db, 'pointClaims', [
  fakePointClaim({ taskId: task.id, userId: userOne.id }),
])

describe('create points', () => {
  it('should create points for the user', async () => {
    // Given
    const newPointData = { userId: userTwo.id }

    // When
    const result = await repository.createPoints(newPointData)

    // Then
    expect(result).toBeTruthy()
    expect(result).toMatchObject({
      ...newPointData,
      groupId: null,
      points: 0,
    })
  })

  it('should create points for the group user', async () => {
    // Given
    const newPointData = { userId: userTwo.id, groupId: groupOne.id }

    // When
    const result = await repository.createPoints(newPointData)

    // Then
    expect(result).toBeTruthy()
    expect(result).toMatchObject({
      ...newPointData,
      points: 0,
    })
  })

  it('should throw error if user id is invalid', async () => {
    // Given
    const invalidUserId = { userId: userTwo.id + randomId() }

    // Then
    await expect(repository.createPoints(invalidUserId)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })

  it('should Throw error if group id is invalid', async () => {
    // Given
    const invalidGroupId = {
      userId: userTwo.id,
      groupId: groupOne.id + randomId(),
    }

    // Then
    await expect(repository.createPoints(invalidGroupId)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })
})

describe('get points data', () => {
  it('should get user points data by user id and group id', async () => {
    // Given
    const userId = userOne.id
    const groupId = groupOne.id
    // When
    const userPoints = await repository.getPoints({ userId })
    const groupUserPoints = await repository.getPoints({ userId, groupId })

    // Then
    expect(userPoints).toMatchObject({
      userId,
      points: pointsOne.points,
      groupId: null,
    })

    expect(groupUserPoints).toMatchObject({
      groupId,
      userId,
      points: pointsTwo.points,
    })
  })
})

describe('points claims', () => {
  it('should add point claims', async () => {
    // Given
    const claimData = {
      userId: userOne.id,
      taskId: task.id,
      taskInstanceDate: new Date(),
    }

    // When
    const result = await repository.addPointClaims(claimData)

    // Then
    expect(result).toBeTruthy()
    expect(result).toMatchObject({
      ...claimData,
      id: expect.any(Number),
    })
  })

  it('should throw error if claim task id is invalid', async () => {
    // Given
    const claimData = {
      userId: userOne.id,
      taskId: task.id + randomId(),
      taskInstanceDate: new Date(),
    }

    // Then
    await expect(repository.addPointClaims(claimData)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })

  it('should throw error if claim user id is invalid', async () => {
    // Given
    const claimData = {
      userId: userOne.id + randomId(),
      taskId: task.id,
      taskInstanceDate: new Date(),
    }
    // Then
    await expect(repository.addPointClaims(claimData)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })

  it('should throw error if claim failed to create', async () => {
    // Given
    const claimData = {
      userId: userOne.id,
      taskId: task.id,
      taskInstanceDate: new Date(),
      anything: 'any',
    }
    // Then
    await expect(repository.addPointClaims(claimData)).rejects.toThrowError()
  })

  it('should get point claim data by user id, task id and task instance date', async () => {
    // Given
    const { userId, taskId, taskInstanceDate } = pointClaim
    // When
    const result = await repository.getPointClaims({
      userId,
      taskId,
      taskInstanceDate,
    })

    // Then
    expect(result).toEqual(pointClaim)
  })
})

describe('alter user points', () => {
  it('should add points to the existing user points', async () => {
    // Given
    const alterPoints = { userId: userOne.id, points: 20, action: '+' as const }
    const { createdAt, ...pointsData } = pointsOne

    // When
    const result = await repository.alterPoints(alterPoints)

    // Then
    expect(result).toBeTruthy()
    expect(result).toEqual({
      ...pointsData,
      points: pointsOne.points + alterPoints.points,
    })
  })

  it('should subtract points to the existing user points', async () => {
    // Given
    const alterPoints = { userId: userOne.id, points: 1, action: '-' as const }
    const { createdAt, ...pointsData } = pointsOne

    // When
    const result = await repository.alterPoints(alterPoints)

    // Then
    expect(result).toBeTruthy()
    expect(result).toEqual({
      ...pointsData,
      points: pointsOne.points - alterPoints.points,
    })
  })

  it('should set points to the existing user points', async () => {
    // Given
    const alterPoints = { userId: userOne.id, points: 50, action: '=' as const }
    const { createdAt, ...pointsData } = pointsOne

    // When
    const result = await repository.alterPoints(alterPoints)

    // Then
    expect(result).toBeTruthy()
    expect(result).toEqual({
      ...pointsData,
      points: alterPoints.points,
    })
  })

  it('should add points to the existing user group points', async () => {
    // Given
    const alterPoints = {
      userId: userOne.id,
      points: 20,
      groupId: groupOne.id,
      action: '+' as const,
    }
    const { createdAt, ...pointsData } = pointsTwo

    // When
    const result = await repository.alterPoints(alterPoints)

    // Then
    expect(result).toBeTruthy()
    expect(result).toEqual({
      ...pointsData,
      points: pointsTwo.points + alterPoints.points,
    })
  })

  it('should subtract points to the existing user group points', async () => {
    // Given
    const alterPoints = {
      userId: userOne.id,
      points: 1,
      groupId: groupOne.id,
      action: '-' as const,
    }
    const { createdAt, ...pointsData } = pointsTwo

    // When
    const result = await repository.alterPoints(alterPoints)

    // Then
    expect(result).toBeTruthy()
    expect(result).toEqual({
      ...pointsData,
      points: pointsTwo.points - alterPoints.points,
    })
  })

  it('should set points to the existing user group points', async () => {
    // Given
    const alterPoints = {
      userId: userOne.id,
      points: 50,
      groupId: groupOne.id,
      action: '=' as const,
    }
    const { createdAt, ...pointsData } = pointsTwo

    // When
    const result = await repository.alterPoints(alterPoints)

    // Then
    expect(result).toBeTruthy()
    expect(result).toEqual({
      ...pointsData,
      points: alterPoints.points,
    })
  })

  it('should throw error if group id is invalid', async () => {
    // Given
    const alterPoints = {
      userId: userOne.id,
      points: 50,
      groupId: groupOne.id + randomId(),
      action: '=' as const,
    }

    // Then
    await expect(repository.alterPoints(alterPoints)).rejects.toThrowError(
      /no result/i
    )
  })

  it('should throw error if user id is invalid', async () => {
    // Given
    const alterPoints = {
      userId: userOne.id + randomId(),
      points: 50,
      groupId: groupOne.id,
      action: '=' as const,
    }

    // Then
    await expect(repository.alterPoints(alterPoints)).rejects.toThrowError(
      /no result/i
    )
  })

  it('should throw error if action is invalid', async () => {
    // Given
    const alterPoints = {
      userId: userOne.id,
      points: 50,
      groupId: groupOne.id,
      action: '*' as const,
    }

    // Then
    // @ts-expect-error
    await expect(repository.alterPoints(alterPoints)).rejects.toThrowError(
      /Invalid action/i
    )
  })
})

describe('delete points', () => {
  it('should delete user points by user id', async () => {
    // Given
    const userId = userOne.id

    // When
    const result = await repository.deletePoints({ userId })

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toEqual(1n)
  })

  it('should delete user points by user id and group id', async () => {
    // Given
    const userId = userOne.id
    const groupId = groupOne.id

    // When
    const result = await repository.deletePoints({ userId, groupId })

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toEqual(1n)
  })

  it('should not throw error if no deleted rows for user points by user id and group id', async () => {
    // Given
    const userId = userOne.id
    const groupId = randomId()
    // When
    const result = await repository.deletePoints({ userId, groupId })

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toBeFalsy()
    expect(result.numDeletedRows).toEqual(0n)
  })
})
