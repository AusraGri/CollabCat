import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable('rewards')
    .addColumn('id', 'integer', (c) =>
        c.primaryKey().generatedAlwaysAsIdentity()
      )
    .addColumn('title', 'varchar(100)', (c)=> c.notNull())
    .addColumn('cost', 'integer', (c)=> c.notNull())
    .addColumn('created_by_user_id', 'integer', (c) => c.references('user.id').onDelete('cascade'))
    .addColumn('amount', 'integer')
    .addColumn('group_id', 'integer', (c)=> c.references('groups.id').onDelete('cascade'))
    .addColumn('target_user_ids', sql`integer[]`)
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('rewards').execute()
}
