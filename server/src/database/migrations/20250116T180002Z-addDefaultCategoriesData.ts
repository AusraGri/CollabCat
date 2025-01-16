import type { Kysely } from 'kysely'
import { categories } from '../data/defaultCategories'

export async function up(db: Kysely<any>) {
    await db
  .insertInto('categories')
  .values(categories)
  .execute()
}

export async function down(db: Kysely<any>) {
    await db
    .deleteFrom('categories')
    .where('is_default', 'is', true)
    .execute()
}
