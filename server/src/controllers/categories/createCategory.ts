import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { categoriesRepository } from '@server/repositories/categoriesRepository'
import provideRepos from '@server/trpc/provideRepos'
import {
  insertCategorySchema,
  publicCategorySchema,
} from '@server/entities/categories'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ categoriesRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'POST',
      path: '/categories/create',
      tags: ['category'],
      protect: true,
      summary: 'Create new Category',
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      example: {
        request: {
          title: 'New Category'
        },
      },
    },
  })
  .input(insertCategorySchema)
  .output(publicCategorySchema)
  .mutation(async ({ input: categoryData, ctx: { authUser, repos } }) => {
    const newCategory = {
      ...categoryData,
      createdByUserId: authUser.id,
    }

    const categoryCreated =
      await repos.categoriesRepository.createCategory(newCategory)

    return categoryCreated
  })
