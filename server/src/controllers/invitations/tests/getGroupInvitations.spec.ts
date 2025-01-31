import { authRepoContext, requestContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { InvitationsRepository } from '@server/repositories/invitationRepository'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import invitationsRouter from '..'

const createCaller = createCallerFactory(invitationsRouter)
const db = await wrapInRollbacks(createTestDatabase())

const invitationRepo = (invitation?: any) => ({
  invitationsRepository: {
    getInvitationByEmail: vi.fn(async () => (invitation ? [invitation] : [])),
  } satisfies Partial<InvitationsRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getGroupInvitations } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(getGroupInvitations()).rejects.toThrow(/unauthenticated/i)
})

it('should get invitations', async () => {
  // ARRANGE
  const invitation = {
    invitationToken: 'Token',
    email: 'some@email.com',
    groupId: 1,
    createdAt: new Date(),
    id: 1
  }
  const repo = invitationRepo(invitation)
  const user = fakeAuthUser()
  const { getGroupInvitations } = createCaller(authRepoContext(repo, user))

  // ACT &ASSERT
  await expect(getGroupInvitations()).resolves.toMatchObject([invitation])

  expect(repo.invitationsRepository.getInvitationByEmail).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.getInvitationByEmail).toHaveBeenCalledWith(
    user.email
  )
})

it('should return empty array if no invitations found', async () => {
  // ARRANGE
  const repo = invitationRepo()
  const user = fakeAuthUser()
  const { getGroupInvitations } = createCaller(authRepoContext(repo, user))

  // ACT &ASSERT
  await expect(getGroupInvitations()).resolves.toMatchObject([])

  expect(repo.invitationsRepository.getInvitationByEmail).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.getInvitationByEmail).toHaveBeenCalledWith(
    user.email
  )
})
