import { authRepoContext, requestContext } from '@tests/utils/context'
import { fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { type PointsRepository } from '@server/repositories/pointsRepository'
import type { DeleteResult } from 'kysely'
import pointsRouter from '..'

const createCaller = createCallerFactory(pointsRouter)
const db = await wrapInRollbacks(createTestDatabase())

const mockRepo = (bigInt: BigInt = 0n,) => ({
  pointsRepository: {
    deletePoints: vi.fn(async () => ({numDeletedRows: bigInt} as DeleteResult)),
  } satisfies Partial<PointsRepository>,
})


it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { deletePoints } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(deletePoints({})).rejects.toThrow(/unauthenticated/i)
})

it('should throw error if input is not valid', async () => {
  // ARRANGE
  const repo = mockRepo()
  const input = { groupId: 'cat'}
  const inputTwo = undefined
  const inputThreeValid= {anything: 'any'}
  const { deletePoints } = createCaller(authRepoContext(repo))

  // ACT & ASSERT

  // @ts-expect-error
  await expect(deletePoints(input)).rejects.toThrowError(/invalid_type/i)
  // @ts-expect-error
  await expect(deletePoints(inputTwo)).rejects.toThrowError(
    /invalid_type/i
  )
  // @ts-expect-error
  await expect(deletePoints(inputThreeValid)).rejects.toThrowError(/unrecognized_keys/i)

})

it('should return message if no data was deleted', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo()
  const { deletePoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(deletePoints({})).resolves.toMatchObject({
    success: true,
    message: /not found/i
  })

  expect(repo.pointsRepository.deletePoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId: undefined,
  })

  await expect(repo.pointsRepository.deletePoints()).resolves.not.toThrowError();

})

it('should successfully delete user points', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo(5n)
  const { deletePoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(deletePoints({})).resolves.toMatchObject({
    success: true,
    message: /successfully deleted/i
  })

  expect(repo.pointsRepository.deletePoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId: undefined,
  })

  await expect(repo.pointsRepository.deletePoints()).resolves.not.toThrowError();

})

it('should successfully delete user points for group', async () => {
  // ARRANGE
  const authUser = fakeAuthUser()
  const repo = mockRepo(5n)
  const groupId = 234
  const { deletePoints } = createCaller(authRepoContext(repo, authUser))

  // ACT & ASSERT

  await expect(deletePoints({groupId})).resolves.toMatchObject({
    success: true,
    message: /successfully deleted/i
  })

  expect(repo.pointsRepository.deletePoints).toHaveBeenCalledWith({
    userId: authUser.id,
    groupId
  })

  await expect(repo.pointsRepository.deletePoints()).resolves.not.toThrowError();

})