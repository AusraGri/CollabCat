import { requestContext, authGroupRepoContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import type { UserPublic } from '@server/entities/user'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const testDb = createTestDatabase()
const db = await wrapInRollbacks(testDb)

const groupRepo = (groupMember?: any) => ({
  groupsRepository: {
    getGroupMembers: vi.fn(
      async () => (groupMember ? [groupMember] : []) as UserPublic[]
    ),
  } satisfies Partial<GroupRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getGroupMembers } = createCaller(requestContext({ db }))

  // ACT & ASSERTs
  await expect(getGroupMembers({ groupId: 1 })).rejects.toThrow(
    /unauthenticated/i
  )
})

it('should get group members information', async () => {
  // ARRANGE
  const group = { groupId: 1, role: 'Member' }
  const user = {
    id: 1,
    picture: 'some picture',
    username: 'Bob',
    email: 'some@mail.com',
  }
  const repo = groupRepo(user)

  const { getGroupMembers } = createCaller(
    authGroupRepoContext(repo, undefined, group)
  )

  // ACT & ASSERTs
  const result = await getGroupMembers({ groupId: 1 })

  expect(result).toMatchObject([user])
  expect(repo.groupsRepository.getGroupMembers).toHaveBeenCalledOnce()
  await expect(repo.groupsRepository.getGroupMembers()).resolves.toMatchObject([
    user,
  ])
})
