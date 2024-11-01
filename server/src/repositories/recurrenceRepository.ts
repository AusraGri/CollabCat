import type { Database } from '@server/database'
import type { RecurringPattern, RecurringTypes } from '@server/database/types'
import type { Insertable, Selectable } from 'kysely'
import { recurringPatternKeysAll, recurringTypeKeysAll } from '@server/entities/recurrence'

export function recurringRepository(db: Database) {
  return {
    async createPattern(pattern: Insertable<RecurringPattern>): Promise<Selectable<RecurringPattern>> {
      return db
        .insertInto('recurringPattern')
        .values(pattern)
        .returning(recurringPatternKeysAll)
        .executeTakeFirstOrThrow()
    },

    async createType(type: Insertable<RecurringTypes>): Promise<Selectable<RecurringTypes>> {
      return db
        .insertInto('recurringTypes')
        .values(type)
        .returning(recurringTypeKeysAll)
        .executeTakeFirstOrThrow()
    },

    async findPattern(taskId: number): Promise<Selectable<RecurringPattern> | undefined> {
      const pattern = await db
        .selectFrom('recurringPattern')
        .select(recurringPatternKeysAll)
        .where('taskId', '=', taskId)
        .executeTakeFirstOrThrow()

      return pattern
    },
  }
}

export type RecurringRepository = ReturnType<typeof recurringRepository>
