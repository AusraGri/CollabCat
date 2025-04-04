import createApp from './app'
import { createDatabase } from './database'
import config from './config'
import logger from './utils/logger'

const databaseUrl =
  config.env === 'test' ? config.testDatabase : config.database
try {
  const database = createDatabase(databaseUrl)
  const app = createApp(database)

  app.listen(config.port, () => {
    logger.info(
      {
        port: config.port,
        environment: config.env,
      },
      `🚀 Server is running at http://localhost:${config.port} using ${config.env} database`
    )
  })
} catch (error) {
  logger.fatal(
    {
      error: error instanceof Error ? error.message : String(error),
    },
    '❌ Fatal error! Server failed to start'
  )
  process.exit(1)
}
