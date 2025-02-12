import { router } from '../trpc'
import health from './health'
import user from './user'
import tasks from './tasks'
import groups from './groups'
import points from './points'
import rewards from './rewards'
import invitations from './invitations'
import categories from './categories'

export const appRouter = router({
  user,
  tasks,
  groups,
  points,
  rewards,
  invitations,
  categories,
  health,
})

export type AppRouter = typeof appRouter
