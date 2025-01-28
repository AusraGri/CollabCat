import {
  requestContext,
  authRepoContext,
} from '@tests/utils/context'
import {
    fakeAuthUser,
  fakeUserGroup,
} from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import type { UserGroupsPublic } from '@server/entities/userGroups'
import groupsRouter from '..'


const createCaller = createCallerFactory(groupsRouter)
const db = await wrapInRollbacks(createTestDatabase())
const repos = (userGroup: UserGroupsPublic = fakeUserGroup()) => ({
  groupsRepository: {
    addGroupMember: vi.fn(async () => userGroup),
  } satisfies Partial<GroupRepository>,

})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { addUserToGroup } = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(
    addUserToGroup({
      groupId: 1234
    })
  ).rejects.toThrow(/unauthenticated/i)
})

it('should add authenticated user to the group', async () => {
  // ARRANGE
  const user = fakeAuthUser()
  const userGroup = fakeUserGroup({userId: user.id})
  const repo = repos(userGroup)
  const groupId = 1
  const { addUserToGroup } = createCaller(authRepoContext(repo, user))

  // ACT
  const result = await addUserToGroup({groupId})

  expect(result).toMatchObject(userGroup)
  expect(repo.groupsRepository.addGroupMember).toBeCalledWith({
    groupId,
    userId: user.id,
    role: 'Member'
  })
})


