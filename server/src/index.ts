import createApp from './app'
import { createDatabase } from './database'
import config from './config'

// added
const databaseUrl = config.env === 'test' ? config.testDatabase : config.database;

const database = createDatabase(databaseUrl)
const app = createApp(database)


app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server is running at http://localhost:${config.port} using ${config.env} database`);
});
