import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('recurring_type')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('recurring_type', 'varchar(20)', (c) => c.unique())
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('recurring_type')
    .execute()
}
