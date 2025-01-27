import { requestContext, authGroupRepoContext } from '@tests/utils/context'
import { fakeCategory, fakeAuthGroup } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { CategoriesRepository } from '@server/repositories/categoriesRepository'
import categoriesRouter from '..'
import type { CategoriesPublic } from '../../../entities/categories';

const createCaller = createCallerFactory(categoriesRouter)
const db = await wrapInRollbacks(createTestDatabase())

const categoryRepos = (category?: Partial<CategoriesPublic>) => ({
  categoriesRepository: {
    getCategoriesByGroupId: vi.fn(async () =>  category ? [(category as CategoriesPublic)] : []),
  } satisfies Partial<CategoriesRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getGroupCategories } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
   getGroupCategories({groupId: 1})
  ).rejects.toThrow(/unauthenticated/i)
})

it('find group categories by group id', async () => {
  // ARRANGE
  const group = fakeAuthGroup()
  const repo = categoryRepos(fakeCategory({id: group.groupId}))
  const { getGroupCategories } = createCaller(authGroupRepoContext(repo, undefined, group))

 // ACT & ASSERT
 const groupCategories = await getGroupCategories({groupId: group.groupId})
   expect(groupCategories).toMatchObject([{
    id: expect.any(Number),
    createdByUserId: expect.any(Number),
  }])

  expect(repo.categoriesRepository.getCategoriesByGroupId).toBeCalledWith(
  group.groupId
  )
})

it('should return empty array if no categories found', async () => {
  // ARRANGE
  const repo = categoryRepos()
  const group = fakeAuthGroup()
  const { getGroupCategories } = createCaller(authGroupRepoContext(repo, undefined, group))

  // ACT & ASSERT
  const groupCategories = await getGroupCategories({groupId: group.groupId})
   expect(groupCategories).toMatchObject([])

  expect(repo.categoriesRepository.getCategoriesByGroupId).toBeCalledWith(
  group.groupId
  )
})