import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase, mockRepository } from '@tests/utils/database'
import { deleteAuth0User } from '@server/auth0/deleteAuth0User'
import type { DeleteResult } from 'kysely'
import type { Mock } from 'vitest'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

vi.mock('@server/auth0/deleteAuth0User', () => ({
  deleteAuth0User: vi.fn(),
}))

const mockedRepo = (bigInt: BigInt = 0n, user?: any) =>
  mockRepository('userRepository', {
    deleteUser: async () => ({ numDeletedRows: bigInt }) as DeleteResult,
    findById: async () => user || undefined,
  })

describe('delete user', () => {
  const authUser = fakeAuthUser()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw an error if user is not authenticated', async () => {
    // ARRANGE
    const { deleteUser } = createCaller(requestContext({ db }))

    // ACT & ASSERT
    await expect(deleteUser()).rejects.toThrow(/unauthenticated/i)
  })

  it('should delete user from database, delete from Auth0 database, and return success message', async () => {
    // ARRANGE
    const userToDelete = { id: authUser.id, auth0Id: 'auth0-123' }
    const repo = mockedRepo(5n, userToDelete) // User found in repository
    const { deleteUser } = createCaller(authRepoContext(repo, authUser))

    // ACT & ASSERT
    await expect(deleteUser()).resolves.toMatchObject({
      success: true,
      message: /successfully deleted/i,
    })

    // Check the calls to delete the user and the Auth0 deletion
    expect(repo.userRepository.deleteUser).toHaveBeenCalledWith(authUser.id)
    expect(repo.userRepository.findById).toHaveBeenCalledWith(authUser.id)
    expect(deleteAuth0User).toHaveBeenCalledWith('auth0-123')
  })

  it('should not call deleteAuth0User if user is not found', async () => {
    // ARRANGE
    const repo = mockedRepo() // No user found
    const { deleteUser } = createCaller(authRepoContext(repo, authUser))

    // ACT & ASSERT
    await expect(deleteUser()).resolves.toMatchObject({
      success: true,
      message: /not found/i,
    })

    expect(deleteAuth0User).not.toHaveBeenCalled()
    expect(repo.userRepository.deleteUser).toHaveBeenCalledWith(authUser.id)
  })

  it('should handle error when deleteAuth0User fails', async () => {
    // ARRANGE
    const userToDelete = { id: authUser.id, auth0Id: 'auth0-123' }
    const repo = mockedRepo(5n, userToDelete)
    const mocked = deleteAuth0User as Mock
    mocked.mockRejectedValue(new Error('Auth0 deletion failed'))

    const { deleteUser } = createCaller(authRepoContext(repo, authUser))

    // ACT & ASSERT
    await expect(deleteUser()).rejects.toThrow('Auth0 deletion failed')

    expect(deleteAuth0User).toHaveBeenCalledWith('auth0-123')
    expect(repo.userRepository.deleteUser).not.toHaveBeenCalledWith(authUser.id)
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
    expect(repo.userRepository.findById).toHaveBeenCalledWith(authUser.id)
    expect(deleteAuth0User).not.toHaveBeenCalled()
    expect(repo.userRepository.deleteUser).toBeCalledWith(authUser.id)
  })
})
