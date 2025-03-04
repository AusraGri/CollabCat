import { repoContext } from '@tests/utils/context'
import { fakeGroup, randomId } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import type { GroupRepository } from '@server/repositories/groupsRepository'
import groupsRouter from '..'

const createCaller = createCallerFactory(groupsRouter)
const repos = (group?: any) => ({
  groupsRepository: {
    getGroup: vi.fn(async () => group || undefined),
  } satisfies Partial<GroupRepository>,
})

it('should get group info by group id', async () => {
  // ARRANGE
  const group = fakeGroup({ id: randomId() })
  const repo = repos(group)
  const { getGroupInfo } = createCaller(repoContext(repo))

  // ACT
  const result = await getGroupInfo({ groupId: group.id })

  expect(result).toBe(group)
  expect(repo.groupsRepository.getGroup).toBeCalledWith({ id: group.id })
})

it('should return undefined if no group info found by created user id', async () => {
  // ARRANGE
  const repo = repos()
  const groupId = randomId()

  const { getGroupInfo } = createCaller(repoContext(repo))

  // ACT
  const result = await getGroupInfo({ groupId })

  expect(result).toBe(undefined)
  expect(repo.groupsRepository.getGroup).toBeCalledWith({ id: groupId })
})
