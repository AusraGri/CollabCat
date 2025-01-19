import {
  authContext,
  requestContext,
  authGroupRepoContext,
} from '@tests/utils/context'
import {
  fakeGroup,
  fakeUser,
  fakeUserGroup,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import type { InvitationsRepository } from '@server/repositories/invitationRepository'
import { sentInvitationMail } from '@server/emailer'
import {
  type UserRepository,
} from '@server/repositories/userRepository'
import groupsRouter from '..'

vi.mock('@server/emailer', () => ({
  sentInvitationMail: vi.fn().mockResolvedValue(undefined),
  mailTransporter: {
    send: vi.fn().mockResolvedValue('Email sent successfully'),
  },
}))

const createCaller = createCallerFactory(groupsRouter)
const db = await wrapInRollbacks(createTestDatabase())
const repos = {
  userRepository: {
    findByEmail: vi.fn(async () => undefined),
  } satisfies Partial<UserRepository>,
  groupsRepository: {
    getGroupMembers: vi.fn(async () => []),
    getRole: vi.fn(async () => ({ role: 'Admin' })),
  } satisfies Partial<GroupRepository>,

  invitationsRepository: {
    getInvitationByGroupAndEmail: vi.fn(async () => undefined),
    createInvitation: vi.fn(async () => ({
      id: 1,
      email: 'email@mail.com',
      groupId: 124,
      invitationToken: 'token',
      createdAt: new Date(),
    })),
  } satisfies Partial<InvitationsRepository>,
}

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { inviteUser } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
    inviteUser({
      email: 'some@email.mail',
      groupId: 1234,
    })
  ).rejects.toThrow(/unauthenticated/i)
})

it('should throw an error if user is has no permission to invite', async () => {
  // ARRANGE
  const [user, otherUser] = await insertAll(db, 'user', [
    fakeUser(),
    fakeUser(),
  ])
  const [group] = await insertAll(
    db,
    'groups',
    fakeGroup({ createdByUserId: otherUser.id })
  )
  const { inviteUser } = createCaller(authContext({ db }, user))

  // ACT
  await expect(
    inviteUser({
      groupId: group.id,
      email: 'some@email.mail',
    })
  ).rejects.toThrow(/Unauthorized/i)
})

it('should throw an error if user is already in the group', async () => {
  // ARRANGE
  const [user, userInGroup] = await insertAll(db, 'user', [
    fakeUser(),
    fakeUser(),
  ])
  const [group] = await insertAll(
    db,
    'groups',
    fakeGroup({ createdByUserId: user.id })
  )
  await insertAll(db, 'userGroups', [
    fakeUserGroup({ userId: userInGroup.id, groupId: group.id }),
    fakeUserGroup({ userId: user.id, groupId: group.id }),
  ])
  const { inviteUser } = createCaller(authContext({ db }, user))

  // ACT
  await expect(
    inviteUser({
      groupId: group.id,
      email: userInGroup.email,
    })
  ).rejects.toThrow(/in the group/i)
})

it('should invite user to the group (using database) ', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', [fakeUser()])
  const [group] = await insertAll(
    db,
    'groups',
    fakeGroup({ createdByUserId: user.id })
  )
  await insertAll(db, 'userGroups', [
    fakeUserGroup({ userId: user.id, groupId: group.id }),
  ])
  const { inviteUser } = createCaller(authContext({ db }, user))
  // ACT
  const invitation = await inviteUser({
    groupId: group.id,
    email: 'some@email.mail',
  })

  expect(invitation).toHaveProperty('invitationToken')
})

it('should invite user to the group', async () => {
  // ARRANGE
  const { inviteUser } = createCaller(authGroupRepoContext(repos))

  // ACT
  const invitation = await inviteUser({
    groupId: 123,
    email: 'some@email.mail',
  })

  // ASSERT: Verify the invitation token and that the email was sent
  expect(invitation).toHaveProperty('invitationToken')
  expect(invitation.invitationToken).toBeDefined()

  // Check if sentInvitationMail was called with the expected parameters
  expect(sentInvitationMail).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      email: 'some@email.mail',
      inviteToken: expect.any(String),
    })
  )
})
