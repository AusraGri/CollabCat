import config from '@server/config'
import { createDatabase } from '@server/database'
import { Kysely, sql } from 'kysely'

interface SequenceResult {
  sequence: string | null // `sequence` can be null if not found
}

/**
 * Creates a test database instance. In this case, it is the same as the
 * main database instance.
 */
export const createTestDatabase = () => createDatabase(config.database)

/**
 * Cleans a database from any data and resets the id sequence
 * for accurate test results
 */
export async function cleanDatabase(db: Kysely<any>) {
  // Disable foreign key constraints temporarily
  await sql`SET session_replication_role = replica`.execute(db)

  try {
    // Fetch all table names excluding migration-related tables (like 'kysely_migration')
    const result = await db
      .selectFrom('pg_tables')
      .select('tablename')
      .where('schemaname', '=', 'public')
      .where('tablename', 'not like', '%migration%')
      .execute()

    const tableNames = result.map((row) => row.tablename)

    // Delete all data from each table instead of truncating
    await Promise.all(
      tableNames.map(async (table) => {
        const query = `DELETE FROM "public"."${table}"`
        await sql`${sql.raw(query)}`.execute(db)
      })
    )

    // Step 3: Check if the "id" column has an associated sequence and reset it
    await Promise.all(
      tableNames.map(async (table) => {
        try {
          // Check if there is a sequence associated with the "id" column
          const sequenceQuery = sql.raw(`
          SELECT pg_get_serial_sequence('"public"."${table}"', 'id') AS sequence
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = '${table}'
            AND column_name = 'id'
          LIMIT 1
        `)

          const sequenceNameResult = (await sequenceQuery.execute(db)) as {
            rows: SequenceResult[]
          }

          // Ensure proper typing for the result
          const sequenceRow: SequenceResult | undefined =
            sequenceNameResult.rows[0]

          // Check if the result is empty or doesn't have the expected sequence field
          if (!sequenceRow || !sequenceRow.sequence) {
            return
          }

          // Extract the sequence name safely
          const sequenceName = sequenceRow.sequence

          // Reset the sequence to 1
          const resetSequenceQuery = `SELECT setval('${sequenceName}', 1, false)`
          await sql`${sql.raw(resetSequenceQuery)}`.execute(db)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error resetting sequence for table "${table}":`, error)
        }
      })
    )
  } finally {
    // Re-enable foreign key constraints
    await sql`SET session_replication_role = DEFAULT`.execute(db)
  }
}
