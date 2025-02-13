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
          'categories.isGroupDefault',
        ])
        .where(({ eb, or, and, not }) =>
          and([
            or([
              eb('categories.createdByUserId', '=', userId), // Categories created by user
              eb('userGroups.userId', '=', userId), // Categories from groups the user is in
            ]),
            not(eb('categories.isDefault', '=', true)), // Exclude default categories
            not(eb('categories.isGroupDefault', '=', true)), // Exclude group default categories
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
        .where('categories.isGroupDefault', 'is', false)
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
