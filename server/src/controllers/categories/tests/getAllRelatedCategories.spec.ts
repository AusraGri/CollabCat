import { requestContext, authRepoContext } from '@tests/utils/context'
import { fakeCategory, fakeAuthUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { CategoriesRepository } from '@server/repositories/categoriesRepository'
import categoriesRouter from '..'
import type { CategoriesPublic } from '../../../entities/categories'

const createCaller = createCallerFactory(categoriesRouter)
const db = await wrapInRollbacks(createTestDatabase())

const categoryRepos = (category?: Partial<CategoriesPublic>) => ({
  categoriesRepository: {
    getAllRelatedCategoriesByUserId: vi.fn(async () =>
      category ? [category as CategoriesPublic] : []
    ),
  } satisfies Partial<CategoriesRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getAllRelatedCategories } = createCaller(requestContext({ db }))
  // ACT & ASSERT
  await expect(getAllRelatedCategories()).rejects.toThrow(/unauthenticated/i)
})

it('find all related categories to the user by user id', async () => {
  // ARRANGE
  const user = fakeAuthUser()
  const repo = categoryRepos(fakeCategory({ id: 1 }))
  const { getAllRelatedCategories } = createCaller(authRepoContext(repo, user))

  // ACT & ASSERT
  const groupCategories = await getAllRelatedCategories()
  expect(groupCategories).toMatchObject([
    {
      id: expect.any(Number),
      createdByUserId: expect.any(Number),
    },
  ])

  expect(
    repo.categoriesRepository.getAllRelatedCategoriesByUserId
  ).toBeCalledWith(user.id)
})

it('should return empty array if no categories found', async () => {
  // ARRANGE
  const repo = categoryRepos()
  const user = fakeAuthUser()
  const { getAllRelatedCategories } = createCaller(authRepoContext(repo, user))

  // ACT & ASSERT
  const groupCategories = await getAllRelatedCategories()
  expect(groupCategories).toMatchObject([])

  expect(
    repo.categoriesRepository.getAllRelatedCategoriesByUserId
  ).toBeCalledWith(user.id)
})
