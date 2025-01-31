import {
  requestContext,
  authGroupRepoContext,
  authGroupContext,
} from '@tests/utils/context'
import { fakeAuthGroup, fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import type { InvitationsRepository } from '@server/repositories/invitationRepository'
import { sentInvitationMail } from '@server/emailer'
import { type UserRepository } from '@server/repositories/userRepository'
import groupsRouter from '..'

vi.mock('@server/emailer', () => ({
  sentInvitationMail: vi.fn().mockResolvedValue(undefined),
  mailTransporter: {
    send: vi.fn().mockResolvedValue('Email sent successfully'),
  },
}))

const createCaller = createCallerFactory(groupsRouter)
const db = await wrapInRollbacks(createTestDatabase())

const groupRepos = (data: {
  userByEmail?: any
  groupMembers?: any
  isUserInvited?: any
  invitation?: any
}) => ({
  userRepository: {
    findByEmail: vi.fn(async () => data.userByEmail || undefined),
  } satisfies Partial<UserRepository>,
  groupsRepository: {
    getGroupMembers: vi.fn(async () =>
      data.groupMembers ? [data.groupMembers] : []
    ),
  } satisfies Partial<GroupRepository>,

  invitationsRepository: {
    getInvitationByGroupAndEmail: vi.fn(
      async () => data.isUserInvited || undefined
    ),
    createInvitation: vi.fn(async () => {
      if (!data.invitation) throw new Error('Failed to save invitation')

      return data.invitation
    }),
    deleteInvitation: vi.fn(async () => ({ numDeletedRows: BigInt(10) })),
  } satisfies Partial<InvitationsRepository>,
})

const invitation = {
  id: 1,
  email: 'email@mail.com',
  groupId: 124,
  invitationToken: 'token',
  createdAt: new Date(),
}

const email = 'some@email.mail'

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { inviteUser } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
    inviteUser({
      email,
      groupId: 1234,
    })
  ).rejects.toThrow(/unauthenticated/i)
})

it('should throw an error if user is has no permission to invite', async () => {
  // ARRANGE
  const authGroup = fakeAuthGroup({ role: 'Member' })

  const { inviteUser } = createCaller(
    authGroupContext({ db }, undefined, authGroup)
  )

  // ACT
  await expect(
    inviteUser({
      groupId: authGroup.groupId,
      email,
    })
  ).rejects.toThrow(/unauthorized/i)
})

beforeEach(() => {
  vi.clearAllMocks();
});

it('should throw an error if user is already in the group', async () => {
  // ARRANGE
  const member = { email }
  const authGroup = fakeAuthGroup()
  const repo = groupRepos({ groupMembers: member })
  const { inviteUser } = createCaller(
    authGroupRepoContext(repo, undefined, authGroup)
  )

  // ACT
  await expect(
    inviteUser({
      groupId: 1,
      email,
    })
  ).rejects.toThrow(/in the group/i)

  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledWith(
    authGroup.groupId
  )
})

it('should delete existing invitation if user is already invited and create new one', async () => {
  // ARRANGE
  const invitationToken = { invitationToken: 'token' }
  const authGroup = fakeAuthGroup()
  const repo = groupRepos({ isUserInvited: invitationToken, invitation })
  const { inviteUser } = createCaller(
    authGroupRepoContext(repo, undefined, authGroup)
  )
  // ACT
  const result = await inviteUser({
    groupId: 1,
    email,
  })

  expect(result).toHaveProperty('invitationToken')
  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledWith(
    authGroup.groupId
  )
  expect(
    repo.invitationsRepository.getInvitationByGroupAndEmail
  ).toHaveBeenLastCalledWith({ email, groupId: authGroup.groupId })
  expect(repo.invitationsRepository.deleteInvitation).toHaveBeenCalledWith(
    invitationToken.invitationToken
  )
  expect(sentInvitationMail).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      email,
      inviteToken: expect.any(String),
    })
  )
  
  expect(repo.invitationsRepository.createInvitation).toHaveBeenCalledWith({
    email,
    groupId: authGroup.groupId,
    invitationToken: expect.any(String),
  })
})

it('should invite user to the group by email', async () => {
  // ARRANGE
  const repo = groupRepos({ invitation })
  const { inviteUser } = createCaller(authGroupRepoContext(repo))
  // ACT
  const result = await inviteUser({
    groupId: 123,
    email,
  })

  // ASSERT
  expect(result).toHaveProperty('invitationToken')
  expect(result.invitationToken).toBeDefined()
  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledOnce()
  expect(
    repo.invitationsRepository.getInvitationByGroupAndEmail
  ).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.deleteInvitation).not.toHaveBeenCalled()
  expect(sentInvitationMail).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      email,
      inviteToken: expect.any(String),
    })
  )
  expect(repo.invitationsRepository.createInvitation).toHaveBeenCalledOnce()
})

it('should invite user to the group not by email if user already exists in the database', async () => {
  // ARRANGE
  const user = fakeUser()
  const repo = groupRepos({ invitation, userByEmail: user })
  const { inviteUser } = createCaller(authGroupRepoContext(repo))
  // ACT
  const result = await inviteUser({
    groupId: 123,
    email,
  })

  // ASSERT
  expect(result).toHaveProperty('invitationToken')
  expect(result.invitationToken).toBeDefined()
  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledOnce()
  expect(
    repo.invitationsRepository.getInvitationByGroupAndEmail
  ).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.deleteInvitation).not.toHaveBeenCalled()
  expect(sentInvitationMail).not.toHaveBeenCalled()
  expect(repo.invitationsRepository.createInvitation).toHaveBeenCalledOnce()
})
