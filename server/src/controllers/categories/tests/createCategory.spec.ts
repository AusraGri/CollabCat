import { requestContext, authRepoContext } from '@tests/utils/context'
import { fakeAuthUser, fakeCategory } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { CategoriesRepository } from '@server/repositories/categoriesRepository'
import type {
  CategoriesPublic,
  InsertableCategory,
} from '@server/entities/categories'
import categoriesRouter from '..'

const createCaller = createCallerFactory(categoriesRouter)
const db = await wrapInRollbacks(createTestDatabase())

const categoryRepos = (category?: Partial<InsertableCategory>) => ({
  categoriesRepository: {
    createCategory: vi.fn(
      async () => fakeCategory(category) as CategoriesPublic
    ),
  } satisfies Partial<CategoriesRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { createCategory } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
    createCategory({
      title: 'Name',
      groupId: null,
    })
  ).rejects.toThrow(/unauthenticated/i)
})

it('should create a persisted category when user is authorized', async () => {
  // ARRANGE
  const repo = categoryRepos({ id: 1 })
  const user = fakeAuthUser()
  const newCategory = {
    title: 'New Category',
    groupId: null,
  }
  const { createCategory } = createCaller(authRepoContext(repo, user))

  // ACT
  const categoryReturned = await createCategory(newCategory)

  // ASSERT
  expect(categoryReturned).toMatchObject({
    id: expect.any(Number),
    createdByUserId: expect.any(Number),
  })

  expect(repo.categoriesRepository.createCategory).toBeCalledWith({
    ...newCategory,
    createdByUserId: user.id,
  })
})

it('should throw error if input groupId is not valid', async () => {
  // ARRANGE
  const repo = categoryRepos()
  const newCategory = {
    title: 'New Category',
    groupId: 'cat',
  }

  const { createCategory } = createCaller(authRepoContext(repo))

  // ACT & ASSERT
  // @ts-expect-error - Intentionally bypassing type checking for testing
  await expect(createCategory(newCategory)).rejects.toThrowError(
    expect.objectContaining({
      code: 'BAD_REQUEST',
      cause: expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            code: 'invalid_type',
            expected: 'number',
            received: 'string',
            path: ['groupId'],
          }),
        ]),
      }),
    })
  )
})
