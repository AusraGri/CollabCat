import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable('user_group_permissions')
    .addColumn('user_id', 'integer', (c)=> c.notNull().references('user.id').onDelete("cascade"))
    .addColumn('group_id', 'integer', (c)=> c.notNull().references('groups.id').onDelete('cascade'))
    .addColumn('permission_id', 'integer', (c)=> c.notNull().references('permissions.id').onDelete('cascade'))
    .addUniqueConstraint('unique_user_group_permission', [
        'user_id',
        'group_id',
        'permission_id',
      ])
      .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
    .dropTable('user_group_permissions')
    .execute()
}
