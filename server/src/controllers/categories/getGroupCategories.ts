import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { categoriesRepository } from '@server/repositories/categoriesRepository'
import provideRepos from '@server/trpc/provideRepos'
import { publicCategorySchema } from '@server/entities/categories'
import z from 'zod'
import { errorLoggingMiddleware } from '@server/middlewares/errorLoggingMiddleware'

export default groupAuthProcedure
  .use(provideRepos({ categoriesRepository }))
  .use(errorLoggingMiddleware)
  .meta({
    openapi: {
      method: 'GET',
      path: '/categories/getForGroup',
      tags: ['category'],
      protect: true,
      contentTypes: ['application/x-www-form-urlencoded', 'application/json'],
      summary: 'Get categories for the group, by group id',
      example: {
        request: {},
      },
    },
  })
  .input(z.object({}))
  .output(z.array(publicCategorySchema))
  .query(async ({ ctx: { userGroup, repos } }) => {
    const groupCategories =
      await repos.categoriesRepository.getCategoriesByGroupId(
        userGroup?.groupId
      )

    return groupCategories
  })
