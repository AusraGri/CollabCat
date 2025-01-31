import { repoContext } from '@tests/utils/context'
import { createCallerFactory } from '@server/trpc'
import type { Mock } from 'vitest'
import type { InvitationsRepository } from '@server/repositories/invitationRepository'
import * as validation from '../utils/tokenValidation'
import invitationsRouter from '..'


vi.mock('../utils/tokenValidation', () => ({
  validateAndDecodeJWT: vi.fn()
}))


const createCaller = createCallerFactory(invitationsRouter)

const mockRepo = (invitation?: any) => ({
  invitationsRepository: {
    getInvitationByToken: vi.fn(async () => invitation || undefined),
  } satisfies Partial<InvitationsRepository>
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

const tokenValidation = validation.validateAndDecodeJWT as Mock

it('should throw an error if user does not have invitation', async () => {
  // ARRANGE
  const repo = mockRepo()
  const { validateInvitationToken } = createCaller(repoContext(repo))

  // ACT & ASSERT
  await expect(validateInvitationToken(input)).rejects.toThrow(/unauthorized/i)

  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledWith(input.invitationToken)
  await expect(repo.invitationsRepository.getInvitationByToken()).resolves.toEqual(undefined)
})

it('should throw error if invitation token is not valid', async () => {
  // ARRANGE
  const repo = mockRepo(invitation)
  const { validateInvitationToken } = createCaller(repoContext(repo))
  tokenValidation.mockImplementation(() => {
    throw new Error('invalid')
  })

  // ACT &ASSERT

  await expect(validateInvitationToken(input)).rejects.toThrowError(/invalid/i)

  expect(tokenValidation).toHaveBeenCalledWith(invitation.invitationToken)
  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledWith(
    input.invitationToken
  )
})

it('should return invitation data', async () => {
  // ARRANGE
  const repo = mockRepo(invitation)
  const { validateInvitationToken } = createCaller(repoContext(repo))
  const decoded = {
    user: {
        email: 'some@email.com'
    },
    iat: 123,
    exp: 234
  }
  tokenValidation.mockReturnValueOnce(decoded)

  // ACT &ASSERT

  await expect(validateInvitationToken(input)).resolves.toMatchObject({
    decoded,
    invitation
  })

  expect(tokenValidation).toHaveBeenCalledWith(invitation.invitationToken)
  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.getInvitationByToken).toHaveBeenCalledWith(
    input.invitationToken
  )
})
