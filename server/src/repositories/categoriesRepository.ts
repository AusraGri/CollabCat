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
        .where((eb) =>
          eb.or([
            eb('categories.groupId', '=', groupId),
            eb('categories.isDefault', 'is', true),
          ])
        )
        .execute()
    },
    async getCategoriesByUserId(userId: number): Promise<CategoriesPublic[]> {
      return db
        .selectFrom('categories')
        .select(categoriesKeysAll)
        .where('createdByUserId', '=', userId)
        .execute()
    },

    async getAllRelatedCategoriesByUserId(
      userId: number
    ): Promise<CategoriesPublic[]> {
      return db
        .selectFrom('categories')
        .leftJoin('userGroups', 'categories.groupId', 'userGroups.groupId')
        .select([
          'categories.createdByUserId',
          'categories.groupId',
          'categories.id',
          'categories.title',
          'categories.isDefault',
        ])
        .where(({ eb, or, and, not }) =>
          and([
            or([
              eb('categories.createdByUserId', '=', userId),
              eb('userGroups.userId', '=', userId),
            ]),
            not(eb('categories.isDefault', '=', true)),
          ])
        )
        .execute()
    },
    async getPersonalCategoriesByUserId(
      userId: number
    ): Promise<CategoriesPublic[]> {
      return db
        .selectFrom('categories')
        .select(categoriesKeysAll)
        .where('categories.groupId', 'is', null)
        .where((eb) =>
          eb.or([
            eb('categories.createdByUserId', '=', userId),
            eb('categories.isDefault', 'is', true),
          ])
        )
        .execute()
    },

    async deleteCategory(categoryId: number): Promise<DeleteResult> {
      return db
        .deleteFrom('categories')
        .where('id', '=', categoryId)
        .executeTakeFirst()
    },
  }
}

export type CategoriesRepository = ReturnType<typeof categoriesRepository>
