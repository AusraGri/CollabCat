import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('categories')
    .addColumn('group_id', 'integer', (c) =>
      c.references('groups.id').onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('categories').dropColumn('group_id').execute()
}
