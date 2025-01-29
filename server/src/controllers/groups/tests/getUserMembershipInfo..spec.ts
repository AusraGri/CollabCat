import { requestContext, authGroupRepoContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import {
  fakeAuthGroup,
  fakeAuthUser,
} from '@server/entities/tests/fakes'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const testDb = createTestDatabase()
const db = await wrapInRollbacks(testDb)

const groupRepo = (memberInfo?: any) => ({
  groupsRepository: {
    getUserGroupMembershipInfo: vi.fn(async () => {
      if (!memberInfo) {
        throw new Error('Not found')
      }
      return memberInfo
    }),
  } satisfies Partial<GroupRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getMembershipInfo } = createCaller(requestContext({ db }))

  // ACT & ASSERTs
  await expect(getMembershipInfo({ groupId: 1 })).rejects.toThrow(
    /unauthenticated/i
  )
})

it('should get group member information for provided user id', async () => {
  // ARRANGE
  const member = {
    id: 1,
    points: null,
    role: 'Member',
    email: 'some@mail.com',
    username: 'Bob',
    picture: 'picture',
  }
  const user = fakeAuthUser()
  const group = fakeAuthGroup()
  const repo = groupRepo(member)
  const userId = 1

  const { getMembershipInfo } = createCaller(
    authGroupRepoContext(repo, user, group)
  )

  // ACT & ASSERTs
  const result = await getMembershipInfo({ groupId: group.groupId, userId })

  expect(result).toMatchObject(member)

  expect(
    repo.groupsRepository.getUserGroupMembershipInfo
  ).toHaveBeenCalledOnce()

  expect(repo.groupsRepository.getUserGroupMembershipInfo).toHaveBeenCalledWith(
    { userId, groupId: group.groupId }
  )

  await expect(
    repo.groupsRepository.getUserGroupMembershipInfo()
  ).resolves.toMatchObject(member)
})

it('should get group member information for auth user if user id is not provided', async () => {
  // ARRANGE
  const user = fakeAuthUser()
  const group = fakeAuthGroup()

  const member = {
    id: user.id,
    points: null,
    role: 'Member',
    email: 'some@mail.com',
    username: 'Bob',
    picture: 'picture',
  }
  const repo = groupRepo(member)

  const { getMembershipInfo } = createCaller(
    authGroupRepoContext(repo, user, group)
  )

  // ACT & ASSERTs
  const result = await getMembershipInfo({ groupId: group.groupId })

  expect(result).toMatchObject(member)

  expect(
    repo.groupsRepository.getUserGroupMembershipInfo
  ).toHaveBeenCalledOnce()

  expect(repo.groupsRepository.getUserGroupMembershipInfo).toHaveBeenCalledWith(
    { userId: user.id, groupId: group.groupId }
  )

  await expect(
    repo.groupsRepository.getUserGroupMembershipInfo()
  ).resolves.toMatchObject(member)
})

it('should throw error if no information about user found ', async () => {
  // ARRANGE
  const user = fakeAuthUser()
  const group = fakeAuthGroup()
  const repo = groupRepo()
  const userId = 1
  const { getMembershipInfo } = createCaller(
    authGroupRepoContext(repo, user, group)
  )

  // ACT & ASSERTs

  await expect(getMembershipInfo({ groupId: group.groupId, userId })).rejects.toThrowError('Not found')

  expect(
    repo.groupsRepository.getUserGroupMembershipInfo
  ).toHaveBeenCalledOnce()

  expect(repo.groupsRepository.getUserGroupMembershipInfo).toHaveBeenCalledWith(
    { userId, groupId: group.groupId }
  )

  await expect(
    repo.groupsRepository.getUserGroupMembershipInfo()
  ).rejects.toThrowError('Not found')
})
