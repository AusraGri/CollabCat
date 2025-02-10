import {
  requestContext,
  authGroupContext,
  authGroupRepoContext,
} from '@tests/utils/context'
import { fakeUser, fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import type { DeleteResult } from 'kysely'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const testDb = createTestDatabase()
const db = await wrapInRollbacks(testDb)

const groupRepo = (groupMember?: any, bigInt: BigInt = BigInt(10)) => ({
  groupsRepository: {
    getGroupMembers: vi.fn(async () => (groupMember ? [groupMember] : [])),
    removeUserFromGroup: vi.fn(
      async () => ({ numDeletedRows: bigInt }) as DeleteResult
    ),
  } satisfies Partial<GroupRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { removeUser } = createCaller(requestContext({ db }))

  // ACT & ASSERTs
  await expect(removeUser({ userId: 12, groupId: 0 })).rejects.toThrow(
    /unauthenticated/i
  )
})

it('should throw an error if user is authenticated, but does not have permission to remove another user', async () => {
  // ARRANGE
  const group = { groupId: 1, role: 'Member' }
  const user = fakeAuthUser()

  const { removeUser } = createCaller(authGroupContext({ db }, user, group))

  // ACT & ASSERTs
  await expect(removeUser({ userId: user.id + 1, groupId: 1 })).rejects.toThrow(
    /unauthorized/i
  )
})

it('should throw an error if user is authenticated, but tries to remove user that does not belong to the group', async () => {
  // ARRANGE
  const group = { groupId: 1, role: 'Admin' }
  const user = fakeAuthUser()
  const userToRemove = fakeUser({ id: user.id + 1 })
  const repo = groupRepo(userToRemove)

  const { removeUser } = createCaller(authGroupRepoContext(repo, user, group))

  // ACT & ASSERTs
  await expect(
    removeUser({ userId: userToRemove.id + 1, groupId: 1 })
  ).rejects.toThrow(/not found/i)

  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getGroupMembers()).resolves.toMatchObject([
    userToRemove,
  ])
  expect(repo.groupsRepository.removeUserFromGroup).not.toBeCalled()
})

it('should throw an error if user is not successfully deleted', async () => {
  // ARRANGE
  const group = { groupId: 1, role: 'Admin' }
  const user = fakeAuthUser()
  const userToRemove = fakeUser({ id: user.id + 1 })
  const repo = groupRepo(userToRemove, BigInt(0))

  const { removeUser } = createCaller(authGroupRepoContext(repo, user, group))

  // ACT & ASSERTs
  await expect(
    removeUser({ userId: userToRemove.id, groupId: 1 })
  ).rejects.toThrow(/failed/i)

  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getGroupMembers()).resolves.toMatchObject([
    userToRemove,
  ])
  expect(repo.groupsRepository.removeUserFromGroup).toHaveBeenCalledOnce()
})

it('should delete user from group by user id', async () => {
  // ARRANGE
  const group = { groupId: 1, role: 'Admin' }
  const user = fakeAuthUser()
  const userToRemove = fakeUser({ id: user.id + 1 })
  const repo = groupRepo(userToRemove)

  const { removeUser } = createCaller(authGroupRepoContext(repo, user, group))

  // ACT & ASSERTs
  await expect(
    removeUser({ userId: userToRemove.id, groupId: 1 })
  ).resolves.toEqual(true)
  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getGroupMembers()).resolves.toMatchObject([
    userToRemove,
  ])
  expect(repo.groupsRepository.removeUserFromGroup).toHaveBeenCalledOnce()
})
