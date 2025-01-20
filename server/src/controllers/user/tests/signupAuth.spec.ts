import { repoContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import {
  verifyAuth0Token,
  type Auth0TokenPayload,
} from '@server/auth0/verifyAuth0Token'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)

const repos = (user?: any, createdUser?: any) => ({
  userRepository: {
    findByEmail: vi.fn(async () => user),
    create: vi.fn(async () => createdUser),
  },
})

vi.mock('@server/auth0/verifyAuth0Token', () => ({
  verifyAuth0Token: vi.fn(),
}))

describe('authProcedure', () => {
  const mockUser = {
    email: 'test@example.com',
    auth0Id: 'auth0|12345',
    username: 'testuser',
    provider: 'auth0',
    picture: 'http://example.com/picture.jpg',
  }

  const mockUserInput = {
    auth0Token: 'valid-token',
    email: mockUser.email,
    username: mockUser.username,
    picture: mockUser.picture,
  }

  const user = fakeUser({
    ...mockUser,
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  it('should create a new user with valid token and new email', async () => {
    const repository = repos(undefined, user)
    const { signupAuth } = createCaller(repoContext(repository))

    vi.mocked(verifyAuth0Token).mockResolvedValue({
      sub: 'auth0|12345',
    } as Auth0TokenPayload)

    const result = await signupAuth(mockUserInput)

    expect(result).toEqual(user)
    expect(repository.userRepository.create).toHaveBeenCalledWith({
      email: mockUser.email,
      auth0Id: 'auth0|12345',
      username: mockUser.username,
      provider: 'auth0',
      picture: mockUser.picture,
    })
  })

  it('should require a valid email', async () => {
    const { signupAuth } = createCaller(repoContext(repos()))
    await expect(
      signupAuth({ ...mockUserInput, email: 'invalidEmail' })
    ).rejects.toThrow(/email/i)
  })

  it('should require a valid auth0 id', async () => {
    const { signupAuth } = createCaller(repoContext(repos()))
    vi.mocked(verifyAuth0Token).mockRejectedValue(
      new Error('Validation failed')
    )

    await expect(signupAuth(mockUserInput)).rejects.toThrow(/validation/i)
  })

  it('stores lowercased  and trimmed whitespace email', async () => {
    const repository = repos(undefined, user)
    const { signupAuth } = createCaller(repoContext(repository))

    vi.mocked(verifyAuth0Token).mockResolvedValue({
      sub: 'auth0|12345',
    } as Auth0TokenPayload)

    await signupAuth({ ...mockUserInput, email: '    NEW@EMAIL.Com   ' })

    expect(repository.userRepository.create).toHaveBeenCalledWith({
      email: 'new@email.com',
      auth0Id: 'auth0|12345',
      username: mockUser.username,
      provider: 'auth0',
      picture: mockUser.picture,
    })
  })

  it('should return existing user if user is already in the database', async () => {
    const repository = repos(user, undefined)
    const { signupAuth } = createCaller(repoContext(repository))

    vi.mocked(verifyAuth0Token).mockResolvedValue({
      sub: 'auth0|12345',
    } as Auth0TokenPayload)

    const result = await signupAuth(mockUserInput)

    expect(result).toEqual(user)
    expect(repository.userRepository.findByEmail).toBeCalledWith(
      mockUserInput.email
    )
    expect(repository.userRepository.create).not.toBeCalled()
  })

  it('should throw error is user email is already in the database', async () => {
    const repository = {
      userRepository: {
        findByEmail: vi.fn(async () => undefined),
        create: vi.fn(async () => {
          throw new Error('duplicate key')
        }),
      },
    }
    const { signupAuth } = createCaller(repoContext(repository))

    vi.mocked(verifyAuth0Token).mockResolvedValue({
      sub: 'auth0|12345',
    } as Auth0TokenPayload)

    await expect(signupAuth(mockUserInput)).rejects.toThrow(/user/i)
  })
})
