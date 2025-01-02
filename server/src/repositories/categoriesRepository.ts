import type { Database } from '@server/database'
import { DeleteResult } from 'kysely'
import {
  type InsertableCategory,
  type CategoriesPublic,
  categoriesKeysAll,
} from '../entities/categories'

export function categoriesRepository(db: Database) {
  return {
    async createCategory(
      category: InsertableCategory
    ): Promise<CategoriesPublic> {
      return db
        .insertInto('categories')
        .values(category)
        .returning(categoriesKeysAll)
        .executeTakeFirstOrThrow()
    },

    async getCategoriesByGroupId(groupId: number): Promise<CategoriesPublic[]> {
      return db
        .selectFrom('categories')
        .select(categoriesKeysAll)
        .where('groupId', '=', groupId)
        .execute()
    },
    async getCategoriesByUserId(userId: number): Promise<CategoriesPublic[]> {
      return db
        .selectFrom('categories')
        .select(categoriesKeysAll)
        .where('createdByUserId', '=', userId)
        .execute()
    },

    async deleteCategory(categoryId: number): Promise<DeleteResult> {
      return db
        .deleteFrom('categories')
        .where('id', '=', categoryId)
        .executeTakeFirstOrThrow()
    },
  }
}

export type CategoriesRepository = ReturnType<typeof categoriesRepository>
