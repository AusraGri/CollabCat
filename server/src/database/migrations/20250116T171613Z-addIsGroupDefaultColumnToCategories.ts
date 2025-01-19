import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('categories')
    .addColumn('is_group_default', 'boolean', (c) =>
      c.notNull().defaultTo(false)
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('categories')
    .dropColumn('is_group_default')
    .execute()
}
