import { categoriesRepository } from '@server/repositories/categoriesRepository'
import provideRepos from '@server/trpc/provideRepos'
import { publicCategorySchema } from '@server/entities/categories'
import z from 'zod'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'

export default authenticatedProcedure
  .use(provideRepos({ categoriesRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/categories/getUser',
      tags: ['category'],
      protect: true,
      summary: 'Get categories for the user, by user id',
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
