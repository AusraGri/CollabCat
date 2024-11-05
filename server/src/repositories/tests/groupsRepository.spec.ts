import { createTestDatabase } from '@tests/utils/database'
import { DeleteResult } from 'kysely'
import {
  fakeUser,
  fakeGroup,
  fakeUserGroup
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { pick } from 'lodash-es'
import { groupsKeysPublic } from '@server/entities/groups'
import { groupsRepository } from '../groupsRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = groupsRepository(db)

// An example of repository tests with a database.
const [userOne, userTwo] = await insertAll(db, 'user', [fakeUser(), fakeUser()])
const [groupOne, groupTwo] = await insertAll(db, 'groups', [
  fakeGroup({ createdByUserId: userOne.id }),
  fakeGroup({ createdByUserId: userTwo.id }),
])

await insertAll(db, 'userGroups', [fakeUserGroup({userId: userOne.id, groupId: groupOne.id})])

describe('create', () => {
  it('should create a group', async () => {
    // Given
    const group = fakeGroup({ createdByUserId: userOne.id, name: 'New Group' })

    // When
    const createdGroup = await repository.create(group)

    // Then
    expect(createdGroup).toMatchObject({
      id: expect.any(Number),
      ...pick(groupsKeysPublic),
      createdByUserId: userOne.id,
      name: 'New Group',
    })
  })
})

describe('get', () => {
  it('should get a group by group id', async () => {
    // When
    const [group] = await repository.get({ id: groupOne.id })

    // Then
    expect(group).toMatchObject({
      ...groupOne,
    })
  })

  it('should get group by the user who created the group', async () => {
    // When
    const [group] = await repository.get({ createdByUserId: userTwo.id })

    // Then
    expect(group).toMatchObject({
      ...groupTwo,
    })
  })

  it('should get group by the userId', async () => {
    // When
    const group = await repository.get({ userId: userOne.id })

    // Then
    expect(group).toHaveLength(1)
    expect(group[0]).toMatchObject({
      ...groupOne,
    })
  })

  it('should get user role in the group by the userId and groupId', async () => {
    // When
    const role = await repository.getRole({ userId: userOne.id, groupId: groupOne.id })

    // Then
    expect(role).toEqual({role: 'Admin'})
  })
})

describe('update', () => {
  it('should update group name', async () => {
    // Given
    const updatedGroupName = 'New Updated Group'

    // When
    const group = await repository.updateName({
      id: groupOne.id,
      name: updatedGroupName,
    })

    // Then
    expect(group.id).toBe(groupOne.id)
    expect(group.createdByUserId).toBe(groupOne.createdByUserId)
    expect(group.name).toBe(updatedGroupName)
  })

  it('should throw an error if there is no group id to update', async () => {
    // Given
    const groupId = 456

    // When
    await expect(
      repository.updateName({ id: groupId, name: 'Update' })
    ).rejects.toThrowError()
  })
})

describe('users in groups', () => {
  it('should add new user to the group', async () => {
    // Given
    const user = {
      groupId: groupOne.id,
      userId: userTwo.id,
      role: 'User',
    }

    // When
    const group = await repository.addGroupMember(user)

    // Then
    expect(group.groupId).toBe(user.groupId)
    expect(group.role).toBe(group.role)
    expect(group.userId).toBe(user.userId)
  })

  it('should get all users that belongs to the group (by groupId)', async () => {

    // When
    const members = await repository.getGroupMembers(groupOne.id)

    // Then
    expect(members).toHaveLength(1)
    expect(members[0]).toMatchObject({
        id: userOne.id,
        firstName: userOne.firstName,
        lastName: userOne.lastName
    })
  })

  it('should remove user from the group', async () => {
    // Given
    const user = {
      groupId: groupOne.id,
      userId: userOne.id,
    }

    // When
    const group = await repository.removeGroupMember(user)
    const members = await repository.getGroupMembers(groupOne.id)

    // Then
    expect(group).toBeInstanceOf(DeleteResult)
    expect(members).toHaveLength(0)
  })

  it('should throw an error if there is no group id to update', async () => {
    // Given
    const groupId = 456

    // When
    await expect(
      repository.updateName({ id: groupId, name: 'Update' })
    ).rejects.toThrowError()
  })
})
