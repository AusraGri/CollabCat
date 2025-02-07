import type { Kysely } from 'kysely'
import { defaultCategories } from '../data/defaultCategories'

export async function up(db: Kysely<any>) {
  await db.insertInto('categories').values(defaultCategories).execute()
}

export async function down(db: Kysely<any>) {
  await db.deleteFrom('categories').where('is_default', 'is', true).execute()
}
