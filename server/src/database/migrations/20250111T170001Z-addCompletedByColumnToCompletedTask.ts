import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .alterTable('completed_tasks')
    .addColumn('completed_by', 'integer', (c)=> c.references('user.id').onDelete('set null'))
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .alterTable('completed_tasks')
    .dropColumn('completed_by')
    .execute()
}
