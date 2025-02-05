import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase, mockRepository } from '@tests/utils/database'
import type { DeleteResult } from 'kysely'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockedRepo = (bigInt: BigInt = 0n) =>
  mockRepository('userRepository', {
    deleteUser: async () => ({ numDeletedRows: bigInt }) as DeleteResult,
  })

describe('delete user', () => {
  const authUser = fakeAuthUser()

  it('should throw an error if user is not authenticated', async () => {
    // ARRANGE
    const { deleteUser } = createCaller(requestContext({ db }))

    // ACT & ASSERT
    await expect(deleteUser()).rejects.toThrow(/unauthenticated/i)
  })

  it('should delete user and return success message', async () => {
    // ARRANGE
    const repo = mockedRepo(5n)
    const { deleteUser } = createCaller(authRepoContext(repo, authUser))

    // ACT & ASSERT
    await expect(deleteUser()).resolves.toMatchObject({
      success: true,
      message: /successfully deleted/i,
    })
    expect(repo.userRepository.deleteUser).toBeCalledWith(authUser.id)
  })

  it('should return success message if no data was deleted', async () => {
    // ARRANGE
    const repo = mockedRepo()
    const { deleteUser } = createCaller(authRepoContext(repo, authUser))

    // ACT & ASSERT
    await expect(deleteUser()).resolves.toMatchObject({
      success: true,
      message: /not found/i,
    })
    expect(repo.userRepository.deleteUser).toHaveBeenCalledOnce()
    expect(repo.userRepository.deleteUser).toBeCalledWith(authUser.id)
  })
})
