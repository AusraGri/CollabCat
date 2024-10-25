import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('repeat')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('type', 'varchar(50)', (c) => c.notNull())
    .addColumn('interval', 'integer')
    .addColumn('days_of_week', 'varchar(15)', (c) => c.defaultTo(null))
    .addColumn('specific_dates', sql`date[]`, (c) => c.defaultTo(null))
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date')
    .addColumn('start_time', 'timestamptz')
    .addColumn('end_time', 'timestamptz')
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('repeat')
    .execute()
}
