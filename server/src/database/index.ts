import {
  CamelCasePlugin,
  Kysely,
  ParseJSONResultsPlugin,
  PostgresDialect,
} from 'kysely'
import pg from 'pg'
import type { DB } from './types'

export function createDatabase(options: pg.PoolConfig): Kysely<DB> {
  return new Kysely<DB>({
    // log(event) {
    //   if (event.level === "error") {
    //       console.error("Query failed : ", {
    //         durationMs: event.queryDurationMillis,
    //         error: event.error,
    //         sql: event.query.sql,
    //         params: event.query.parameters,
    //       });
    //   } else { // `'query'`
    //     console.log("Query executed : ", {
    //       durationMs: event.queryDurationMillis,
    //       sql: event.query.sql,
    //       params: event.query.parameters,
    //     });
    //   }
    // },
    dialect: new PostgresDialect({
      pool: new pg.Pool(options),
    }),
    plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
  })
}

export type Database = Kysely<DB>
export type DatabasePartial<T> = Kysely<T>
export * from './types'
