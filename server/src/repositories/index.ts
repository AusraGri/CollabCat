import type { Database } from '@server/database'
import { userRepository } from './userRepository'
import { tasksRepository } from './tasksRepository'
import { groupsRepository } from './groupsRepository'
import { recurrenceRepository } from './recurrenceRepository'
import { rewardsRepository } from './rewardsRepository'
import { pointsRepository } from './pointsRepository'
import { categoriesRepository } from './categoriesRepository'
import { invitationsRepository } from './invitationRepository'

export type RepositoryFactory = <T>(db: Database) => T

const repositories = {
  userRepository,
  tasksRepository,
  groupsRepository,
  recurrenceRepository,
  pointsRepository,
  rewardsRepository,
  invitationsRepository,
  categoriesRepository,
}

export type RepositoriesFactories = typeof repositories
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>
}
export type RepositoriesKeys = keyof Repositories

export { repositories }
