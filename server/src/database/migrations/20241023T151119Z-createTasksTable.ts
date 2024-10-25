import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('tasks')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('title', 'varchar(225)', (c) => c.notNull())
    .addColumn('description', 'text')
    .addColumn('deadline', 'timestamptz')
    .addColumn('created_by_user_id', 'integer', (c) =>
      c.notNull().references('user.id').onDelete('cascade')
    )
    .addColumn('assigned_user_id', 'integer', (c) =>
      c.references('user.id').onDelete('set null')
    )
    .addColumn('group_id', 'integer', (c) =>
      c.references('groups.id').onDelete('cascade')
    )
    .addColumn('importance', 'varchar(50)')
    .addColumn('category_id', 'integer', (c) =>
      c.references('categories.id').onDelete('set null')
    )
    .addColumn('completed', 'boolean', (c) => c.notNull().defaultTo(false))
    .addColumn('completed_at', 'timestamptz')
    .addColumn('points', 'integer')
    .addColumn('repeat_id', 'integer', (c) => c.references('repeat.id').onDelete('set null'))
    .execute()

    await db.schema
    .createIndex('idx_tasks_created_by_user')
    .on('tasks')
    .columns(['created_by_user_id'])
    .execute()

  await db.schema
    .createIndex('idx_tasks_assigned_user')
    .on('tasks')
    .columns(['assigned_user_id'])
    .execute()

  await db.schema
    .createIndex('idx_tasks_group')
    .on('tasks')
    .columns(['group_id'])
    .execute()

  await db.schema
    .createIndex('idx_tasks_deadline')
    .on('tasks')
    .columns(['deadline'])
    .execute()

  await db.schema
    .createIndex('idx_tasks_id')
    .on('tasks')
    .columns(['id'])
    .execute()
}
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('tasks').execute()
}
