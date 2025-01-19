import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { categoriesRepository } from '@server/repositories/categoriesRepository'
import provideRepos from '@server/trpc/provideRepos'
import {
  insertCategorySchema,
  categoriesSchema,
} from '@server/entities/categories'

export default authenticatedProcedure
  .use(provideRepos({ categoriesRepository }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/categories/create',
      tags: ['category'],
      protect: true,
      summary: 'Create new Category',
    },
  })
  .input(insertCategorySchema)
  .output(categoriesSchema)
  .mutation(async ({ input: categoryData, ctx: { authUser, repos } }) => {
    const newCategory = {
      ...categoryData,
      createdByUserId: authUser.id,
    }

    const categoryCreated =
      await repos.categoriesRepository.createCategory(newCategory)

    return categoryCreated
  })
