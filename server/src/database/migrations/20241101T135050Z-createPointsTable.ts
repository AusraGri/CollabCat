import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable('points')
    .addColumn('user_id', 'integer', (c)=> c.references('user.id').onDelete('cascade'))
    .addColumn('points', 'integer', (c)=> c.notNull().defaultTo(0))
    .addColumn('group_id', 'integer', (c)=> c.references('groups.id').onDelete('cascade'))
    .addColumn('created_at', 'timestamptz', (c)=>c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('points').execute()
}
