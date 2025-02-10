import { createTestDatabase } from '@tests/utils/database'
import { DeleteResult } from 'kysely'
import {
  fakePoints,
  fakeTask,
  fakeUser,
  randomId,
} from '@server/entities/tests/fakes'
import { random } from '@tests/utils/random'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { userRepository } from '../userRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = userRepository(db)

const [userOne, userTwo] = await insertAll(db, 'user', [fakeUser(), fakeUser()])
const [taskOne, taskTwo] = await insertAll(db, 'tasks', [
  fakeTask({ createdByUserId: userOne.id, assignedUserId: userTwo.id }),
  fakeTask({ createdByUserId: userOne.id }),
])
const [pointsOne] = await insertAll(db, 'points', [
  fakePoints({ userId: userOne.id, groupId: null }),
])

describe('create user', () => {
  it('should create new user', async () => {
    // Given
    const user = fakeUser()

    // When
    const result = await repository.createUser(user)

    // Then
    expect(result).toEqual({
      ...user,
      id: expect.any(Number),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      picture: null,
      provider: 'email',
    })
  })

  it('should throw error if input invalid: no email', async () => {
    // Given
    // @ts-expect-error
    const user = fakeUser({ email: null })

    // Then
    await expect(repository.createUser(user)).rejects.toThrowError(
      /not-null constraint/i
    )
  })

  it('should throw error if input invalid: no auth0 id', async () => {
    // Given
    // @ts-expect-error
    const user = fakeUser({ auth0Id: null })

    // Then
    await expect(repository.createUser(user)).rejects.toThrowError(
      /not-null constraint/i
    )
  })

  it('should throw error if input invalid: additional input keys', async () => {
    // Given
    // @ts-expect-error
    const user = fakeUser({ anything: 'any' })

    // Then
    await expect(repository.createUser(user)).rejects.toThrowError(
      /does not exist/i
    )
  })
})

describe('get user data', () => {
  it('should get user by user email', async () => {
    // Given
    const userEmail = userOne.email
    const noEmail = 'no@email.com'

    // When
    const result = await repository.findByEmail(userEmail)
    const noEmailResult = await repository.findByEmail(noEmail)

    // Then
    expect(result).toEqual(userOne)
    expect(noEmailResult).toBeFalsy()
  })

  it('should get user data by task id where assigned user id is not null', async () => {
    // Given
    const taskId = taskOne.id
    const noTaskId = randomId()
    const noAssignedId = taskTwo.id
    const { id, email, picture, username } = userTwo

    // When
    const result = await repository.findAssignedUsersByTaskId(taskId)
    const noTaskIdResult = await repository.findAssignedUsersByTaskId(noTaskId)
    const noAssignedUserResult =
      await repository.findAssignedUsersByTaskId(noAssignedId)

    // Then
    expect(result).toEqual({
      id,
      email,
      picture,
      username,
    })
    expect(noTaskIdResult).toBeFalsy()
    expect(noAssignedUserResult).toBeFalsy()
  })

  it('should get user data by auth0 id', async () => {
    // Given
    const { auth0Id } = userTwo
    const noAuth0Id = 'noAuth0'

    // When
    const result = await repository.findByAuth0Id(auth0Id)
    const noAuth0Result = await repository.findByAuth0Id(noAuth0Id)

    // Then
    expect(result).toEqual(userTwo)
    expect(noAuth0Result).toBeFalsy()
  })

  it('should find user by user id', async () => {
    // Given
    const userId = userTwo.id
    const noUserId = randomId()

    // When
    const result = await repository.findById(userId)
    const noUserIdResult = await repository.findById(noUserId)

    // Then
    expect(result).toEqual(userTwo)
    expect(noUserIdResult).toBeFalsy()
  })

  it('should find user profile info, user points by user id', async () => {
    // Given
    const { id, picture, email, username } = userOne
    const { points } = pointsOne
    const noUserId = randomId()

    // When
    const result = await repository.findUserInfoById(id)
    const noUserIdResult = await repository.findUserInfoById(noUserId)

    // Then
    expect(result).toEqual({
      id,
      picture,
      username,
      email,
      points,
    })
    expect(noUserIdResult).toBeFalsy()
  })
})

describe('update user', () => {
  it('should update user data', async () => {
    // Given
    const { id, picture } = userTwo
    const newUserData = { username: random.first(), email: random.email() }

    // When
    const result = await repository.updateUser(id, newUserData)

    // Then
    expect(result).toEqual({
      ...newUserData,
      picture,
      id,
    })
  })

  it('should throw error if no user id exist', async () => {
    // Given
    const userId = randomId()
    const newUserData = { username: random.first(), email: random.email() }

    // Then
    await expect(
      repository.updateUser(userId, newUserData)
    ).rejects.toThrowError(/no result/i)
  })

  it('should throw error if user id invalid', async () => {
    // Given
    const userId = random.first()
    const newUserData = { username: random.first(), email: random.email() }

    // Then

    await expect(
      // @ts-expect-error
      repository.updateUser(userId, newUserData)
    ).rejects.toThrowError(/invalid input/i)
  })
  it('should throw error if user data updatable is invalid', async () => {
    // Given
    const { id } = userOne
    const newUserData = {
      username: random.first(),
      email: random.email(),
      lastName: 'Bob',
    }

    // Then
    await expect(repository.updateUser(id, newUserData)).rejects.toThrowError(
      /does not exist/i
    )
  })
})

describe('delete user', () => {
  it('should delete user data by user id', async () => {
    // Given
    const { id } = userTwo

    // When
    const result = await repository.deleteUser(id)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toBe(1n)
  })

  it('should  return zero deleted rows if no data found by user id', async () => {
    // Given
    const userId = randomId()

    // When
    const result = await repository.deleteUser(userId)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toBeFalsy()
    expect(result.numDeletedRows).toBe(0n)
  })
})
