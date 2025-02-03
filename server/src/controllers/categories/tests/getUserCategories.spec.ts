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
    getPersonalCategoriesByUserId: vi.fn(async () =>
      category ? [category as CategoriesPublic] : []
    ),
  } satisfies Partial<CategoriesRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { getGroupCategories } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(getGroupCategories({ groupId: 1 })).rejects.toThrow(
    /unauthenticated/i
  )
})

it('find group categories by group id', async () => {
  // ARRANGE
  const user = fakeAuthUser()
  const repo = categoryRepos(fakeCategory({ id: 1 }))
  const { getUserCategories } = createCaller(authRepoContext(repo, user))

  // ACT & ASSERT
  const groupCategories = await getUserCategories()
  expect(groupCategories).toMatchObject([
    {
      id: expect.any(Number),
      createdByUserId: expect.any(Number),
    },
  ])

  expect(
    repo.categoriesRepository.getPersonalCategoriesByUserId
  ).toBeCalledWith(user.id)
})

it('should return empty array if no categories found', async () => {
  // ARRANGE
  const repo = categoryRepos()
  const user = fakeAuthUser()
  const { getUserCategories } = createCaller(authRepoContext(repo, user))

  // ACT & ASSERT
  const groupCategories = await getUserCategories()
  expect(groupCategories).toMatchObject([])

  expect(
    repo.categoriesRepository.getPersonalCategoriesByUserId
  ).toBeCalledWith(user.id)
})
