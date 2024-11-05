import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>) {
await db.schema
.createTable('recurring_pattern')
.addColumn('task_id', 'integer', (c)=> c.references('tasks.id').primaryKey())
.addColumn('recurring_type', 'varchar(50)', (c)=> c.notNull())
.addColumn('separation_count', 'integer', (c)=> c.notNull().defaultTo(0))
.addColumn('max_num_of_occurrences', 'integer')
.addColumn('day_of_week', sql`integer[]`)
.addColumn('week_of_month', sql`integer[]`)
.addColumn('day_of_month', sql`integer[]`)
.addColumn('month_of_year', sql`integer[]`)
.execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('recurring_pattern')
    .execute()
}
