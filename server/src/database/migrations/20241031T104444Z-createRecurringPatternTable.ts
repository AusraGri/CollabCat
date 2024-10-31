import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>) {
await db.schema
.createTable('recurring_pattern')
.addColumn('task_id', 'integer', (c)=> c.references('tasks.id').primaryKey())
.addColumn('recurring_type_id', 'integer', (c)=> c.references('recurring_types.id').onDelete('cascade'))
.addColumn('separation_count', 'integer')
.addColumn('max_num_of_occurrences', 'integer')
.addColumn('day_of_week', 'integer')
.addColumn('week_of_month', 'integer')
.addColumn('day_of_month', 'integer')
.addColumn('month_of_year', 'integer')
.addCheckConstraint(
    'check_days_of_week',
    sql`days_of_week IS NULL OR days_of_week BETWEEN 1 AND 7`
  )
.addCheckConstraint(
    'check_day_of_month',
    sql`day_of_month IS NULL OR day_of_month BETWEEN 1 AND 31`
  )
.execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('recurring_pattern')
    .execute()
}
