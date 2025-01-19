import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure/index'
import { categoriesRepository } from '@server/repositories/categoriesRepository'
import provideRepos from '@server/trpc/provideRepos'
import { z } from 'zod'
import { idSchema } from '@server/entities/shared'

export default authenticatedProcedure
  .use(provideRepos({ categoriesRepository }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/categories/delete',
      tags: ['category'],
      protect: true,
      summary: 'Delete Category',
    },
  })
  .input(
    z.object({
      categoryId: idSchema,
    })
  )
  .output(z.boolean())
  .mutation(async ({ input: { categoryId }, ctx: { repos } }) => {
    const categoryDeleted =
      await repos.categoriesRepository.deleteCategory(categoryId)

    return !!categoryDeleted.numDeletedRows
  })
