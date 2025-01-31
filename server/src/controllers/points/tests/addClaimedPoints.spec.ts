import {
  authRepoContext,
  requestContext,
} from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { setDateToUTCmidnight } from '@server/controllers/utility/helpers'
import { type PointsRepository } from '@server/repositories/pointsRepository'
import pointsRouter from '..'

const createCaller = createCallerFactory(pointsRouter)
const db = await wrapInRollbacks(createTestDatabase())

vi.mock('@server/controllers/utility/helpers', () => ({
  setDateToUTCmidnight: vi.fn(()=> new Date())
}))

const mockRepo = (pointClaim?: any) => ({
  pointsRepository: {
    addPointClaims: vi.fn(async () => {
      if (!pointClaim) throw new Error('failed to add')

      return pointClaim
    }),
  } satisfies Partial<PointsRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { addClaimedPoints } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
    addClaimedPoints({
      taskId: 1,
      taskInstanceDate: new Date(),
    })
  ).rejects.toThrow(/unauthenticated/i)
})

const claimedPoints = {
  id: 1,
  userId: 1,
  taskId: 1,
  claimedAt: new Date(),
  taskInstanceDate: new Date(),
}

const validInput = { taskId: 1, taskInstanceDate: new Date() }

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo()
  const input = { taskId: 'cat', taskInstanceDate: 'cat' }
  const inputTwo = { taskId: 1, taskInstanceDate: 'cat' }
  const inputThree = { taskInstanceDate: 'cat' }
  const inputFour = {}
  const { addClaimedPoints } = createCaller(authRepoContext(repo))

  // ACT & ASSERT

  // @ts-expect-error
  await expect(addClaimedPoints(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(addClaimedPoints(inputTwo)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(addClaimedPoints(inputThree)).rejects.toThrowError(
    /invalid_type/i
  )
  // @ts-expect-error
  await expect(addClaimedPoints(inputFour)).rejects.toThrowError(
    /invalid_type/i
  )
})

it('should throw error if failed to add data to claimed points', async () => {
  // ARRANGE

  const repo = mockRepo()
  const { addClaimedPoints } = createCaller(authRepoContext(repo))

  // ACT & ASSERT
  await expect(addClaimedPoints(validInput)).rejects.toThrowError(/failed/i)
  expect(setDateToUTCmidnight).toHaveBeenCalledWith(validInput.taskInstanceDate)
})

it('should add point claim', async () => {
  // ARRANGE
const authUser = fakeAuthUser()
  const repo = mockRepo(claimedPoints)
  const { addClaimedPoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT
  await expect(addClaimedPoints(validInput)).resolves.toMatchObject(claimedPoints)

  expect(setDateToUTCmidnight).toHaveBeenCalledWith(validInput.taskInstanceDate)
  expect(repo.pointsRepository.addPointClaims).toHaveBeenCalledWith({
    userId: authUser.id,
    taskId: validInput.taskId,
    taskInstanceDate: expect.any(Date)
  })
})
