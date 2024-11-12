import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('invitations')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('group_id', 'integer', (c) =>
      c.notNull().references('groups.id').onDelete('cascade')
    )
    .addColumn('email', 'varchar(50)', (c) => c.notNull())
    .addColumn('invitation_token', 'text', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addUniqueConstraint('unique_group_email_token', [
      'group_id',
      'email',
      'invitation_token',
    ])
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('invitations').execute()
}
