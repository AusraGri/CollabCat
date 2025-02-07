import { createTestDatabase } from '@tests/utils/database'
import { DeleteResult } from 'kysely'
import {
  fakeUser,
  fakeGroup,
  randomId,
  fakeInvitation,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { invitationsRepository } from '../invitationRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = invitationsRepository(db)

const [userOne] = await insertAll(db, 'user', [fakeUser()])
const [groupOne] = await insertAll(db, 'groups', [
  fakeGroup({ createdByUserId: userOne.id }),
])
const [invitationOne, invitationTwo, invitationThree] = await insertAll(
  db,
  'invitations',
  [
    fakeInvitation({ groupId: groupOne.id, email: userOne.email }),
    fakeInvitation({ groupId: groupOne.id }),
    fakeInvitation({ groupId: groupOne.id }),
  ]
)

describe('create invitation', () => {
  it('should create new invitation', async () => {
    // Given
    const invitationData = {
      email: 'some@email.com',
      groupId: groupOne.id,
      invitationToken: 'token',
    }

    // When
    const result = await repository.createInvitation(invitationData)

    // Then
    expect(result).toMatchObject({
      ...invitationData,
      id: expect.any(Number),
    })
  })

  it('should throw error if group id is not in the database', async () => {
    // Given
    const invitationData = {
      email: 'some@email.com',
      groupId: groupOne.id + randomId(),
      invitationToken: 'token',
    }

    // Then
    await expect(
      repository.createInvitation(invitationData)
    ).rejects.toThrowError(/key constraint/i)
  })

  it('should throw error if failed to create invitation (wrong input)', async () => {
    // Given
    const invitationData = {
      email: 'some@email.com',
      groupId: groupOne.id,
      invitationToken: 'token',
      anything: 'any',
    }

    // Then
    await expect(
      repository.createInvitation(invitationData)
    ).rejects.toThrowError()
  })
})

describe(' get invitations', () => {
  it('should get invitation by user email', async () => {
    // Given
    const userEmail = userOne.email

    // When
    const result = await repository.getInvitationByEmail(userEmail)

    // Then
    expect(result).toHaveLength(1)
    expect(result).toContainEqual(invitationOne)
  })

  it('should get invitation by invitation token', async () => {
    // Given
    const { invitationToken } = invitationTwo

    // When
    const result = await repository.getInvitationByToken(invitationToken)

    // Then
    expect(result).toBeTruthy()
    expect(result).toEqual(invitationTwo)
  })

  it('should get invitation by group id and email', async () => {
    // Given
    const { email } = userOne
    const groupId = groupOne.id

    // When
    const result = await repository.getInvitationByGroupAndEmail({
      email,
      groupId,
    })
    const noResult = await repository.getInvitationByGroupAndEmail({
      email: 'any@email.com',
      groupId: randomId(),
    })

    // Then
    expect(result).toBeTruthy()
    expect(noResult).toBeFalsy()
    expect(result).toEqual(invitationOne)
  })
})

describe('delete invitation', () => {
  it('should delete invitation by invitation token', async () => {
    // Given
    const { invitationToken } = invitationThree

    // When
    const result = await repository.deleteInvitation(invitationToken)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toEqual(1n)
  })
})
