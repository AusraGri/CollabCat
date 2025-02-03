import { requestContext, authRepoContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import { fakeAuthUser, fakeGroup } from '@server/entities/tests/fakes'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const testDb = createTestDatabase()
const db = await wrapInRollbacks(testDb)

const groupRepo = (group?: any) => ({
  groupsRepository: {
    getUserGroupsByUserId: vi.fn(async () => (group ? [group] : [])),
  } satisfies Partial<GroupRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getUserGroups } = createCaller(requestContext({ db }))

  // ACT & ASSERTs
  await expect(getUserGroups()).rejects.toThrow(/unauthenticated/i)
})

it('should get group members information', async () => {
  // ARRANGE
  const group = fakeGroup({ id: 1 })
  const user = fakeAuthUser()
  const repo = groupRepo(group)

  const { getUserGroups } = createCaller(authRepoContext(repo, user))

  // ACT & ASSERTs
  const result = await getUserGroups()

  expect(result).toMatchObject([group])
  expect(repo.groupsRepository.getUserGroupsByUserId).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getUserGroupsByUserId).toHaveBeenCalledWith(
    user.id
  )
  await expect(
    repo.groupsRepository.getUserGroupsByUserId()
  ).resolves.toMatchObject([group])
})
