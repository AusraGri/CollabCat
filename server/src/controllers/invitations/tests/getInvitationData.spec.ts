import { authRepoContext, requestContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { InvitationsRepository } from '@server/repositories/invitationRepository'
import { fakeAuthUser, fakeGroup, fakeUser } from '@server/entities/tests/fakes'
import {
    type GroupRepository,
} from '@server/repositories/groupsRepository'
import {
    type UserRepository,
} from '@server/repositories/userRepository'
import invitationsRouter from '..'

const createCaller = createCallerFactory(invitationsRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (data: { invitation?: any; group?: any; user?: any }) => ({
  invitationsRepository: {
    getInvitationByToken: vi.fn(async () => data.invitation || undefined),
    deleteInvitation: vi.fn(async () => ({ numDeletedRows: 1n })),
  } satisfies Partial<InvitationsRepository>,

  groupsRepository: {
    getGroup: vi.fn(async () => (data.group ? [data.group] : [])),
  } satisfies Partial<GroupRepository>,

  userRepository: {
    findById: vi.fn(async () => data.user || undefined),
  } satisfies Partial<UserRepository>,
})

const input = {
  invitationToken: 'Token',
}

const invitation = {
  invitationToken: 'Token',
  email: 'some@email.com',
  groupId: 1,
  createdAt: new Date(),
  id: 1,
}

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getInvitationData } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(getInvitationData(input)).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if invitation not found', async () => {
  // ARRANGE
  const repo = mockRepo({})
  const user = fakeAuthUser()
  const { getInvitationData } = createCaller(authRepoContext(repo, user))

  // ACT &ASSERT
  await expect(getInvitationData(input)).rejects.toThrowError(/not found/i)

  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledWith(
    input.invitationToken
  )
})

it('should throw error if no group was found by invitation token data and delete invitation', async () => {
  // ARRANGE
  const repo = mockRepo({ invitation })
  const user = fakeAuthUser()
  const { getInvitationData } = createCaller(authRepoContext(repo, user))

  // ACT &ASSERT
  await expect(getInvitationData(input)).rejects.toThrowError(/not found/i)

  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledWith(
    input.invitationToken
  )
  expect(repo.groupsRepository.getGroup).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getGroup).toHaveBeenCalledWith({
    id: invitation.groupId,
  })
  await expect(repo.groupsRepository.getGroup()).resolves.toEqual([])

  expect(repo.invitationsRepository.deleteInvitation).toHaveBeenCalledWith(
    input.invitationToken
  )
})

it('should throw error if no user was found as the inviter and delete invitation', async () => {
  // ARRANGE
  const group = fakeGroup({ id: 1 })
  const repo = mockRepo({ invitation, group })
  const user = fakeAuthUser()
  const { getInvitationData } = createCaller(authRepoContext(repo, user))

  // ACT &ASSERT
  await expect(getInvitationData(input)).rejects.toThrowError(/not found/i)

  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledWith(
    input.invitationToken
  )
  expect(repo.groupsRepository.getGroup).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getGroup).toHaveBeenCalledWith({
    id: invitation.groupId,
  })

  expect(repo.userRepository.findById).toHaveBeenCalledWith(
    group.createdByUserId
  )
  await expect(repo.userRepository.findById()).resolves.toBe(undefined)
  expect(repo.invitationsRepository.deleteInvitation).toHaveBeenCalledWith(
    input.invitationToken
  )
})

it('should return invitation related data: user, group', async () => {
  // ARRANGE
  const group = fakeGroup({ id: 1 })
  const { auth0Id, ...inviter } = fakeUser({ id: 1, picture: 'picture' })
  const repo = mockRepo({ invitation, group, user: inviter })
  const user = fakeAuthUser()
  const { getInvitationData } = createCaller(authRepoContext(repo, user))

  // ACT &ASSERT
  await expect(getInvitationData(input)).resolves.toMatchObject({
    invitation,
    groupName: group.name,
    groupOwner: inviter,
  })

  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledWith(
    input.invitationToken
  )
  expect(repo.groupsRepository.getGroup).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getGroup).toHaveBeenCalledWith({
    id: invitation.groupId,
  })

  expect(repo.userRepository.findById).toHaveBeenCalledWith(
    group.createdByUserId
  )
  await expect(repo.userRepository.findById()).resolves.toBe(inviter)
  expect(repo.invitationsRepository.deleteInvitation).not.toHaveBeenCalled()
})
