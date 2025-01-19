import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema.alterTable('user').addColumn('picture', 'text').execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('user').dropColumn('picture').execute()
}
