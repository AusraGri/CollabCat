import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('user')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('first_name', 'varchar(50)', (column) => column.notNull())
    .addColumn('last_name', 'varchar(50)', (column) => column.notNull())
    .addColumn('email', 'text', (c) => c.unique().notNull())
    .addColumn('password', 'text', (c) => c.notNull())
    .addColumn('auth0_id', 'text', (c) => c.unique())
    .addColumn('provider', 'text', (c) => c.notNull().defaultTo('email'))
    .addColumn('role', 'text', (c) => c.notNull().defaultTo('user'))
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (c) =>
      c
        .defaultTo(sql`CURRENT_TIMESTAMP`)
        .notNull()
    )
    .execute()

}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('user').execute()
}
