import { requestContext, authRepoContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import type { CategoriesRepository } from '@server/repositories/categoriesRepository'
import type { DeleteResult } from 'kysely'
import categoriesRouter from '..'

const createCaller = createCallerFactory(categoriesRouter)
const db = await wrapInRollbacks(createTestDatabase())

const categoryRepos = (bigInt?: BigInt) => ({
  categoriesRepository: {
    deleteCategory: vi.fn(async () => ({numDeletedRows: bigInt } as DeleteResult)),
  } satisfies Partial<CategoriesRepository>,
})

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const { deleteCategory } = createCaller(requestContext({ db }))

  // ACT & ASSERT
  await expect(
   deleteCategory({
    categoryId: 1,
    })
  ).rejects.toThrow(/unauthenticated/i)
})

it('should delete the category', async () => {
  // ARRANGE
  const repo = categoryRepos(BigInt(10))
  const categoryId = 1
  const { deleteCategory } = createCaller(authRepoContext(repo))

 // ACT & ASSERT
  await expect(deleteCategory({categoryId})).resolves.toBe(true)

  expect(repo.categoriesRepository.deleteCategory).toBeCalledWith(
  categoryId
  )
})

it('should return false if no category was deleted', async () => {
  // ARRANGE
  const repo = categoryRepos()
  const categoryId = 1
  const { deleteCategory } = createCaller(authRepoContext(repo))

  // ACT & ASSERT
  await expect(deleteCategory({categoryId})).resolves.toBe(false)

  expect(repo.categoriesRepository.deleteCategory).toBeCalledWith(
  categoryId
  )
})