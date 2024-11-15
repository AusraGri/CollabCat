import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable('permissions')
    .addColumn('id', 'integer', (c) =>
        c.primaryKey().generatedAlwaysAsIdentity()
      )
    .addColumn('permission_name', 'varchar(50)', (c)=>c.notNull().unique())
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('permissions')
    .execute()
}
