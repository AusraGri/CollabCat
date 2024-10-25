/* eslint-disable no-console */
import 'dotenv/config'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import {
  FileMigrationProvider,
  Migrator,
  type Kysely,
  type MigrationResult,
  type MigrationResultSet,
} from 'kysely'
import config from '@server/config'
import { createDatabase } from '..'

const MIGRATIONS_PATH = '../migrations'

async function migrateDown(db: Kysely<any>, stepCount = 1) {
  const dirname = path.dirname(fileURLToPath(import.meta.url))

  const nodeProvider = new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(dirname, MIGRATIONS_PATH),
  })

  const migrator = new Migrator({
    db,
    provider: nodeProvider,
  })

  let results: MigrationResult[] = []
  let error: Error | null = null

  const migrationPromises: Promise<MigrationResultSet>[] = []

  for (let i = 0; i < stepCount; i += 1) {
    migrationPromises.push(migrator.migrateDown())
  }

  const migrationResults = await Promise.all(migrationPromises)

  migrationResults.forEach(({ results: stepResults, error: stepError }) => {
    if (stepError) {
      if (stepError instanceof Error) {
        error = stepError
      } else {
        error = new Error(String(stepError))
      }
      return
    }
    if (stepResults) {
      results = results.concat(stepResults)
    }
  })

  results.forEach((it) => {
    if (it.status === 'Success') {
      console.info(
        `Migration "${it.migrationName}" was rolled back successfully.`
      )
    } else if (it.status === 'Error') {
      console.error(`Failed to rollback migration "${it.migrationName}".`)
    }
  })

  if (error) {
    console.error('Failed to rollback migrations.')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

const pathToThisFile = path.resolve(fileURLToPath(import.meta.url))
const pathPassedToNode = path.resolve(process.argv[1])
const isFileRunDirectly = pathToThisFile.includes(pathPassedToNode)

if (isFileRunDirectly) {
  const db = createDatabase(config.database)

  const stepCount = parseInt(process.argv[2], 10) || 1
  await migrateDown(db, stepCount)
}
