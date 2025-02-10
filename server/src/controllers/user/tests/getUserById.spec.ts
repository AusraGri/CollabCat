import { repoContext } from '@tests/utils/context'
import { randomId } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { mockRepository } from '@tests/utils/database'
import type { Selectable } from 'kysely'
import type { User } from '@server/database'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)

const mockedRepo = (user?: any) =>
  mockRepository('userRepository', {
    findById: async () => (user as Selectable<User>) || undefined,
  })

describe('find user by user id', () => {
  const validInput = { userId: randomId() }
  const user = {
    username: 'Bob',
    email: 'some@email.com',
    id: validInput.userId,
    picture: 'pic',
  }

  it('should return user by id', async () => {
    // ARRANGE
    const repo = mockedRepo(user)
    const { getUserById } = createCaller(repoContext(repo))

    // ACT & ASSERT
    await expect(getUserById(validInput)).resolves.toMatchObject(user)
    expect(repo.userRepository.findById).toBeCalledWith(validInput.userId)
  })

  it('should return undefined if user is not found by id', async () => {
    // ARRANGE
    const repo = mockedRepo()
    const { getUserById } = createCaller(repoContext(repo))

    // ACT & ASSERT
    await expect(getUserById(validInput)).resolves.toBeUndefined()
    expect(repo.userRepository.findById).toBeCalledWith(validInput.userId)
  })
})
