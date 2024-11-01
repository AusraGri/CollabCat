import type { Database } from '@server/database'
import { userRepository } from './userRepository'
import { tasksRepository } from './tasksRepository'
import { groupsRepository } from './groupRepository'
import { recurringRepository } from './recurrenceRepository'
import { rewardsRepository } from './rewardsRepository'
import { pointsRepository } from './pointsRepository'

export type RepositoryFactory = <T>(db: Database) => T

// index of all repositories for provideRepos
const repositories = {
  userRepository,
  tasksRepository,
  groupsRepository,
  recurringRepository,
  pointsRepository,
  rewardsRepository,
}

export type RepositoriesFactories = typeof repositories
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>
}
export type RepositoriesKeys = keyof Repositories

export { repositories }
