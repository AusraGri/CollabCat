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
      path: '/categories/get',
      tags: ['category'],
      protect: true,
      summary:
        'Get all categories related to user (user group categories included)',
    },
  })
  .input(z.void())
  .output(z.array(publicCategorySchema))
  .query(async ({ ctx: { authUser, repos } }) => {
    const categories =
      await repos.categoriesRepository.getAllRelatedCategoriesByUserId(
        authUser.id
      )

    return categories
  })
