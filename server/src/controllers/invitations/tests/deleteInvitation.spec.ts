import { authRepoContext, requestContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { DeleteResult } from 'kysely'
import type { InvitationsRepository } from '@server/repositories/invitationRepository'
import invitationsRouter from '..'

const createCaller = createCallerFactory(invitationsRouter)
const db = await wrapInRollbacks(createTestDatabase())

const invitationRepo = (bigInt: BigInt = BigInt(1)) => ({
  invitationsRepository: {
    deleteInvitation: vi.fn(
      async () => ({ numDeletedRows: bigInt }) as DeleteResult
    ),
  } satisfies Partial<InvitationsRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { deleteInvitation } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
    deleteInvitation({
      invitationToken: 'Token',
    })
  ).rejects.toThrow(/unauthenticated/i)
})

it('should delete invitation', async () => {
  // ARRANGE
  const repo = invitationRepo()
  const token = 'Token'
  const { deleteInvitation } = createCaller(authRepoContext(repo))

  // ACT &ASSERT
  await expect(
    deleteInvitation({
      invitationToken: token,
    })
  ).resolves.toMatchObject({ success: true, message: / successfully deleted/i })

  expect(repo.invitationsRepository.deleteInvitation).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.deleteInvitation).toHaveBeenCalledWith(
    token
  )
})

it('should return success if no rows were deleted with the message', async () => {
  // ARRANGE
  const repo = invitationRepo()
  const token = 'Token'
  const { deleteInvitation } = createCaller(authRepoContext(repo))

  // ACT &ASSERT
  await expect(
    deleteInvitation({
      invitationToken: token,
    })
  ).resolves.toMatchObject({ success: true, message: /not found/i })

  expect(repo.invitationsRepository.deleteInvitation).toHaveBeenCalledOnce()
  expect(repo.invitationsRepository.deleteInvitation).toHaveBeenCalledWith(
    token
  )
})
