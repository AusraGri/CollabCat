import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('reward_claims')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('user_id', 'integer', (c) =>
      c.notNull().references('user.id').onDelete('cascade')
    )
    .addColumn('reward_id', 'integer', (c) =>
      c.notNull().references('rewards.id').onDelete('cascade')
    )
    .addColumn('claimed_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('reward_claims').execute()
}
