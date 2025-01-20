import { authContext, repoContext } from '@tests/utils/context'
import type { UserRepository } from '@server/repositories/userRepository'
import { createCallerFactory, router } from '..'
import { authenticatedProcedure } from './index'

const routes = router({
  testCall: authenticatedProcedure.query(() => 'passed'),
})

const createCaller = createCallerFactory(routes)

const VALID_TOKEN = 'valid-token'

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: (token: string) => {
      if (token !== VALID_TOKEN) throw new Error('Invalid token')

      return { user: { id: 2, email: 'valid@email.com' } }
    },
  },
}))

const repos = {
  userRepository: {
    findByAuth0Id: vi.fn(async () => ({
      auth0Id: '1',
      createdAt: new Date(),
      email: 'mail',
      id: 1,
      picture: 'pic',
      provider: 'google',
      updatedAt: new Date(),
      username: 'User',
    })),
  } satisfies Partial<UserRepository>,
}
const reposUserUndefined = {
  userRepository: {
    findByAuth0Id: vi.fn(async () => undefined),
  } satisfies Partial<UserRepository>,
}

const mockReq = {
  isTest: true,
} as any
const mockRes = {} as any

const db = {} as any
const authenticated = createCaller(
  authContext({ db, req: mockReq, res: mockRes })
)

it('should pass if user is already authenticated', async () => {
  const response = await authenticated.testCall()

  expect(response).toEqual('passed')
})

it('should pass if user provides a valid token', async () => {
  const usingValidToken = createCaller(repoContext(repos))

  const response = await usingValidToken.testCall()

  expect(response).toEqual('passed')
})

it('should throw an error if user is not in database', async () => {
  const unauthenticated = createCaller(repoContext(reposUserUndefined))

  await expect(unauthenticated.testCall()).rejects.toThrow(
    /login|log in|logged in|authenticate|unauthorized/i
  )
})
