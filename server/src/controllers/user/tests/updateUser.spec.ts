import { authRepoContext, requestContext } from '@tests/utils/context'
import {
  fakeAuthUser,
  fakeUser,
  fakeUserPublic,
} from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createTestDatabase, mockRepository } from '@tests/utils/database'
import type { UserPublic } from '@server/entities/user'
import { random } from '@tests/utils/random'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockedRepo = (user?: any, updatedUser?: any) =>
  mockRepository('userRepository', {
    findById: async () => user || undefined,
    updateUser: async () => {
      if (!updatedUser) throw new Error('failed to update')
      return updatedUser as UserPublic
    },
  })

describe('update user info', () => {
  const authUser = fakeAuthUser()
  const validInput = { username: random.string().slice(0, 10) }
  const userGoogle = fakeUser({
    createdAt: new Date(),
    id: authUser.id,
    picture: 'pic',
    provider: 'google',
    updatedAt: new Date(),
  })
  const userNotGoogle = { ...userGoogle, provider: 'any' }

  const updatedUser = fakeUserPublic()

  it('should throw an error if user is not authenticated', async () => {
    // ARRANGE
    const { updateUser } = createCaller(requestContext({ db }))

    // ACT & ASSERT
    await expect(updateUser(validInput)).rejects.toThrow(/unauthenticated/i)
  })

  it('should throw error if no user data found', async () => {
    // ARRANGE
    const repo = mockedRepo()
    const { updateUser } = createCaller(authRepoContext(repo, authUser))

    // ACT & ASSERT
    await expect(updateUser(validInput)).rejects.toThrowError(/not authorized/i)
    expect(repo.userRepository.findById).toBeCalledWith(authUser.id)
    expect(repo.userRepository.updateUser).not.toBeCalled()
  })

  it('should update user username and picture if auth provider not google', async () => {
    // ARRANGE
    const repo = mockedRepo(userNotGoogle, updatedUser)
    const { updateUser } = createCaller(authRepoContext(repo, authUser))

    // ACT & ASSERT
    await expect(updateUser(validInput)).resolves.toMatchObject(updatedUser)
    expect(repo.userRepository.findById).toBeCalledWith(authUser.id)
    expect(repo.userRepository.updateUser).toBeCalledWith(authUser.id, {
      ...validInput,
      picture: expect.any(String),
    })
  })

  it('should update only username if auth provider is google', async () => {
    // ARRANGE
    const repo = mockedRepo(userGoogle, updatedUser)
    const { updateUser } = createCaller(authRepoContext(repo, authUser))

    // ACT & ASSERT
    await expect(updateUser(validInput)).resolves.toMatchObject(updatedUser)
    expect(repo.userRepository.findById).toBeCalledWith(authUser.id)
    expect(repo.userRepository.updateUser).toBeCalledWith(authUser.id, {
      ...validInput,
    })
  })
})
