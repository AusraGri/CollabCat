import {
  CamelCasePlugin,
  Kysely,
  ParseJSONResultsPlugin,
  PostgresDialect,
} from 'kysely'
import pg from 'pg'
import logger from '@server/utils/logger'
import type { DB } from './types'

const SLOW_QUERY_THRESHOLD_MS = 1000

// export function createDatabase(options: pg.PoolConfig): Kysely<DB> {
//   return new Kysely<DB>({
//     dialect: new PostgresDialect({
//       pool: new pg.Pool(options),
//     }),
//     plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
//   })
// }

export function createDatabase(options: pg.PoolConfig): Kysely<DB> {
  const pool = new pg.Pool(options)

  // Handle database connection errors (fatal errors)
  pool.on('error', (err) => {
    logger.error(
      {
        error: err.message,
        stack: err.stack,
      },
      "Database pool error detected!"
    );
  })

  return new Kysely<DB>({
    log(event) {
      if (event.level === 'error') {
        logger.error(
          {
            durationMs: event.queryDurationMillis,
            error: event.error,
            sql: event.query.sql,
            params: event.query.parameters,
          },
          'Database query failed!'
        )
      } else if (event.level === 'query') {
        const duration = event.queryDurationMillis

        if (duration > SLOW_QUERY_THRESHOLD_MS) {
          logger.warn(
            {
              durationMs: duration,
              sql: event.query.sql,
              params: event.query.parameters,
            },
            'Slow query detected!'
          )
        } else {
          logger.debug(
            {
              durationMs: duration,
              sql: event.query.sql,
              params: event.query.parameters,
            },
            'Query executed successfully.'
          )
        }
      }
    },
    dialect: new PostgresDialect({ pool }),
    plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
  })
}

export type Database = Kysely<DB>
export type DatabasePartial<T> = Kysely<T>
export * from './types'
