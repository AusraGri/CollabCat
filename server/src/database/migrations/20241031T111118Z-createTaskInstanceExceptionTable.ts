import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable('task_instance_exception')
    .addColumn('id', 'integer', (c) => c.generatedAlwaysAsIdentity().primaryKey())
    .addColumn('task_id', 'integer', (c)=> c.references('tasks.id').notNull().references('tasks.id').onDelete('cascade'))
    .addColumn('is_rescheduled', 'boolean')
    .addColumn('is_canceled', 'boolean')
    .addColumn('start_date', 'timestamptz', (c)=> c.notNull())
    .addColumn('end_date', 'timestamptz', (c) => c.notNull())
    .addColumn('is_full_day_event', 'boolean', (c)=>c.defaultTo(false))
    .addColumn('created_by', 'integer', (c)=> c.notNull().references('user.id').onDelete('cascade'))
    .addColumn('created_at', 'timestamptz', (c)=> c.notNull())
    .execute()


}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('task_instance_exception')
    .execute()
}
