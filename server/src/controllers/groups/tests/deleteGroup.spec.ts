import { authGroupRepoContext } from '@tests/utils/context'
import { fakeAuthGroup, fakeAuthUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import type { DeleteResult } from 'kysely'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const repos = (bigInt: BigInt = BigInt(10)) => ({
  groupsRepository: {
    delete: vi.fn(async () => ({ numDeletedRows: bigInt }) as DeleteResult),
  } satisfies Partial<GroupRepository>,
})

it('should throw an error if user is not authorized', async () => {
  // ARRANGE
  const repo = repos()
  const authGroup = fakeAuthGroup({ role: 'Member' })
  const { deleteGroup } = createCaller(
    authGroupRepoContext(repo, undefined, authGroup)
  )

  // ACT & ASSERT
  await expect(
    deleteGroup({
      groupId: 1234,
    })
  ).rejects.toThrow(/unauthorized/i)
})

it('should delete the group', async () => {
  // ARRANGE
  const repo = repos()
  const group = fakeAuthGroup()
  const user = fakeAuthUser()
  const { deleteGroup } = createCaller(authGroupRepoContext(repo, user, group))

  // ACT
  const result = await deleteGroup({ groupId: group.groupId })

  expect(result).toBe(true)
  expect(repo.groupsRepository.delete).toBeCalledWith({
    id: group.groupId,
    createdByUserId: user.id,
  })
})

it('should throw error if there was no group to delete', async () => {
  // ARRANGE
  const repo = repos(BigInt(0))
  const group = fakeAuthGroup()
  const user = fakeAuthUser()
  const { deleteGroup } = createCaller(authGroupRepoContext(repo, user, group))

  // ACT
  await expect(deleteGroup({ groupId: group.groupId })).rejects.toThrowError()

  expect(repo.groupsRepository.delete).toBeCalledWith({
    id: group.groupId,
    createdByUserId: user.id,
  })
})
