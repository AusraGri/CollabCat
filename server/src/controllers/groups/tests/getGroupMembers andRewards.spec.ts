import { requestContext, authGroupRepoContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const testDb = createTestDatabase()
const db = await wrapInRollbacks(testDb)

const groupRepo = (groupData?: any) => ({
  groupsRepository: {
    getGroupMembersAndRewards: vi.fn(async () => groupData || undefined),
  } satisfies Partial<GroupRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getGroupMembersAndRewards } = createCaller(requestContext({ db }))

  // ACT & ASSERTs
  await expect(getGroupMembersAndRewards({ groupId: 1 })).rejects.toThrow(
    /unauthenticated/i
  )
})

it('should get group members and rewards information', async () => {
  // ARRANGE
  const group = { groupId: 1, role: 'Member' }
  const groupData = {
    id: 1,
    name: 'Group',
    members: [
      {
        id: 22,
        picture: 'some picture',
        username: 'Bob',
        email: 'some@mail.com',
        role: 'Member',
        points: null,
      },
    ],
    rewards: [],
  }
  const repo = groupRepo(groupData)

  const { getGroupMembersAndRewards } = createCaller(
    authGroupRepoContext(repo, undefined, group)
  )

  // ACT & ASSERTs
  const result = await getGroupMembersAndRewards({ groupId: group.groupId })

  expect(result).toMatchObject(groupData)
  expect(repo.groupsRepository.getGroupMembersAndRewards).toHaveBeenCalledOnce()
  expect(repo.groupsRepository.getGroupMembersAndRewards).toHaveBeenCalledWith(
    group.groupId
  )
  await expect(
    repo.groupsRepository.getGroupMembersAndRewards()
  ).resolves.toMatchObject(groupData)
})
