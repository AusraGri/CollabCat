import { groupAuthProcedure } from '@server/trpc/groupAuthProcedure'
import { categoriesRepository } from '@server/repositories/categoriesRepository'
import provideRepos from '@server/trpc/provideRepos'
import { categoriesSchema } from '@server/entities/categories'
import z from 'zod'

export default groupAuthProcedure
  .use(provideRepos({ categoriesRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/categories/getGroup',
      tags: ['category'],
      protect: true,
      summary: 'Get categories for the group, by group id',
    },
  })
  .input(z.object({}))
  .output(z.array(categoriesSchema))
  .query(async ({ ctx: { userGroup, repos } }) => {
    const groupCategories =
      await repos.categoriesRepository.getCategoriesByGroupId(
        userGroup?.groupId
      )

    return groupCategories
  })
