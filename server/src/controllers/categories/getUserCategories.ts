import { categoriesRepository } from '@server/repositories/categoriesRepository'
import provideRepos from '@server/trpc/provideRepos'
import { publicCategorySchema } from '@server/entities/categories'
import z from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default authenticatedProcedure
  .use(provideRepos({ categoriesRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/categories/getPersonal',
      tags: ['category'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get categories for the user (personal), by user id',
    },
  })
  .input(z.void())
  .output(z.array(publicCategorySchema))
  .query(async ({ ctx: { authUser, repos } }) => {
    const userCategories =
      await repos.categoriesRepository.getPersonalCategoriesByUserId(
        authUser.id
      )

    return userCategories
  })
