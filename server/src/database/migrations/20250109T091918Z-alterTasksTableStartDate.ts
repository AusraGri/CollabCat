import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('tasks')
    .alterColumn('start_date', (c) => c.dropNotNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('tasks')
    .alterColumn('start_date', (c) => c.setNotNull())
    .execute()
}
