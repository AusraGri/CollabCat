import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('point_claims')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('userId', 'integer', (c) =>
      c.notNull().references('user.id').onDelete('cascade')
    )
    .addColumn('taskId', 'integer', (c) =>
      c.notNull().references('tasks.id').onDelete('cascade')
    )
    .addColumn('task_instance_date', 'timestamptz', (c) => c.notNull())
    .addColumn('claimed_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('point_claims').execute()
}
