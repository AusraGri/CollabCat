import type { Database } from '@server/database'
import type { RecurringPattern } from '@server/database/types'
import type { Insertable, Selectable } from 'kysely'
import { recurringPatternKeysAll } from '@server/entities/recurrence'

export function recurringRepository(db: Database) {
  return {
    async createPattern(
      pattern: Insertable<RecurringPattern>
    ): Promise<Selectable<RecurringPattern>> {
      return db
        .insertInto('recurringPattern')
        .values(pattern)
        .returning(recurringPatternKeysAll)
        .executeTakeFirstOrThrow()
    },
  }
}

export type RecurringRepository = ReturnType<typeof recurringRepository>
