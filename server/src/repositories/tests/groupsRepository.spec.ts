import { createTestDatabase } from '@tests/utils/database'
import { DeleteResult } from 'kysely'
import {
  fakeUser,
  fakeGroup,
  fakeUserGroup,
  randomId,
  fakeReward,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { pick } from 'lodash-es'
import { groupsKeysPublic } from '@server/entities/groups'
import { groupsRepository } from '../groupsRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = groupsRepository(db)

const [userOne, userTwo] = await insertAll(db, 'user', [fakeUser(), fakeUser()])
const [groupOne, groupTwo, groupThree] = await insertAll(db, 'groups', [
  fakeGroup({ createdByUserId: userOne.id }),
  fakeGroup({ createdByUserId: userTwo.id }),
  fakeGroup({ createdByUserId: userTwo.id }),
])

const [reward] = await insertAll(db, 'rewards', [
  fakeReward({ groupId: groupOne.id, createdByUserId: userOne.id }),
])

await insertAll(db, 'userGroups', [
  fakeUserGroup({ userId: userOne.id, groupId: groupOne.id }),
  fakeUserGroup({ userId: userOne.id, groupId: groupTwo.id }),
])

describe('create group', () => {
  it('should create a group', async () => {
    // Given
    const group = fakeGroup({ createdByUserId: userOne.id, name: 'New Group' })

    // When
    const createdGroup = await repository.createGroup(group)

    // Then
    expect(createdGroup).toMatchObject({
      id: expect.any(Number),
      ...pick(groupsKeysPublic),
      createdByUserId: userOne.id,
      name: 'New Group',
    })
  })
})

describe('delete group', () => {
  it('should delete group by group id', async () => {
    // Given
    const groupId = groupThree.id

    // When
    const deleteResult = await repository.deleteGroup(groupId)
    // Then
    expect(deleteResult).toMatchObject({
      numDeletedRows: expect.any(BigInt),
    })
    expect(Number(deleteResult.numDeletedRows)).toBe(1)
  })

  it('should not throw error id there was no group found by id and return 0 deleted rows', async () => {
    // Given
    const groupId = groupThree.id + 123

    // When
    const deleteResult = await repository.deleteGroup(groupId)
    // Then
    expect(deleteResult).toMatchObject({
      numDeletedRows: expect.any(BigInt),
    })
    expect(Number(deleteResult.numDeletedRows)).toBe(0)
  })
})

describe('get groups', () => {
  it('should get a group by group id', async () => {
    // When
    const [group] = await repository.getGroup({ id: groupOne.id })

    const { createdAt, ...matchGRoup } = groupOne
    // Then
    expect(group).toMatchObject({
      ...matchGRoup,
    })
  })

  it('should return [] if no search options provided', async () => {
    // When
    const group = await repository.getGroup({})

    // Then
    expect(group).toMatchObject([])
  })

  it('should get group by the user id who created the group', async () => {
    // When
    const [group] = await repository.getGroup({ createdByUserId: userTwo.id })

    // Then
    expect(group.id).toEqual(groupTwo.id)
  })

  it('should get groups where user is a member by the userId', async () => {
    // When
    const groups = await repository.getGroup({ userId: userOne.id })

    // Then
    expect(groups.length).toBe(2)
    expect(groups).toMatchObject([
      expect.objectContaining(
        pick(groupOne, ['id', 'name', 'createdByUserId'])
      ),
      expect.objectContaining(
        pick(groupTwo, ['id', 'name', 'createdByUserId'])
      ),
    ])
  })

  it('should get groups where user is a member by the userId', async () => {
    // When
    const groups = await repository.getUserGroupsByUserId(userOne.id)

    // Then
    expect(groups.length).toBe(2)
    expect(groups).toMatchObject([
      expect.objectContaining(
        pick(groupOne, ['id', 'name', 'createdByUserId'])
      ),
      expect.objectContaining(
        pick(groupTwo, ['id', 'name', 'createdByUserId'])
      ),
    ])
  })

  it('should get user role in the group by the userId and groupId', async () => {
    // When
    const role = await repository.getRole({
      userId: userOne.id,
      groupId: groupOne.id,
    })

    // Then
    expect(role).toEqual({ role: 'Admin' })
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
  it('should throw error if adding new user to the group fails', async () => {
    // Given
    const user = {
      groupId: groupOne.id + randomId(),
      userId: userTwo.id + randomId(),
      role: 'User',
    }

    // When & Then
    await expect(repository.addGroupMember(user)).rejects.toThrowError(
      /violates foreign key constraint/i
    )
  })

  it('should get all users that belongs to the group (by groupId)', async () => {
    // When
    const members = await repository.getGroupMembers(groupOne.id)

    // Then
    expect(members).toHaveLength(1)
    expect(members[0]).toMatchObject({
      id: userOne.id,
      username: userOne.username,
    })
  })

  it('should remove user from the group', async () => {
    // Given
    const user = {
      groupId: groupOne.id,
      userId: userOne.id,
    }

    // When
    const group = await repository.removeUserFromGroup(user)
    const members = await repository.getGroupMembers(groupOne.id)

    // Then
    expect(group).toBeInstanceOf(DeleteResult)
    expect(Number(group.numDeletedRows)).toBe(1)
    expect(members).toHaveLength(0)
  })

  it('should get all users data that are in group, by group id', async () => {
    // Given
    const groupId = groupOne.id

    // When
    const users = await repository.getGroupMembers(groupId)

    // Then
    expect(users).toMatchObject([
      pick(userOne, ['id', 'username', 'picture', 'email']),
    ])
    expect(users.length).toBe(1)
  })

  it('should get user membership data by groupId and userId', async () => {
    // Given
    const groupId = groupOne.id
    const userId = userOne.id

    // When
    const users = await repository.getUserGroupMembershipInfo({
      groupId,
      userId,
    })

    // Then
    expect(users).toEqual({
      ...pick(userOne, ['id', 'username', 'picture', 'email']),
      role: expect.any(String),
      points: null,
    })
  })

  it('should throw error if failed to get user membership data by groupId and userId', async () => {
    // Given
    const groupId = groupOne.id + randomId()
    const userId = userOne.id

    // When & Then
    await expect(
      repository.getUserGroupMembershipInfo({ groupId, userId })
    ).rejects.toThrowError(/no result/i)
  })

  it('should retrieve group members info and rewards by the group id', async () => {
    // Given
    const groupId = groupOne.id

    // When
    const groupData = await repository.getGroupMembersAndRewards(groupId)

    // Then
    expect(groupData).toMatchObject({
      ...pick(groupOne, ['id', 'name']),
      rewards: expect.any(Array),
      members: expect.any(Array),
    })

    expect(groupData?.members).toMatchObject([
      {
        ...pick(userOne, ['email', 'id', 'picture', 'username']),
        role: expect.any(String),
        points: null,
      },
    ])

    expect(groupData?.rewards).toMatchObject([reward])
  })
})
