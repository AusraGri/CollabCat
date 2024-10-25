import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable('categories')
    .addColumn('id', 'integer', (c) =>
        c.primaryKey().generatedAlwaysAsIdentity()
      )
    .addColumn('title', 'varchar(50)', (c) => c.notNull().unique())
    .addColumn('created_by_user_id', 'integer', (c) => c.references('user.id').onDelete('cascade'))
    .addColumn('is_default', 'boolean', (c) => c.notNull().defaultTo(false))
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable('categories').execute()
}
