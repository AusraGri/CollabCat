import type { Kysely } from 'kysely'
import { types } from '../data/recurringTypes'

export async function up(db: Kysely<any>) {
  await db.insertInto('recurring_types').values(types).execute()
}

export async function down(db: Kysely<any>) {
  await Promise.all(
    types.map((type) =>
      db
        .deleteFrom('recurring_types')
        .where('recurring_type', '=', type.recurring_type)
        .executeTakeFirstOrThrow()
    )
  )
}
