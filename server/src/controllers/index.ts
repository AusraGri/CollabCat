import { router } from '../trpc'
import user from './user'
import tasks from './tasks'
import groups from './groups'
import points from './points'
import rewards from './rewards'

export const appRouter = router({
// provide controllers
user,
tasks,
groups,
points,
rewards
})

export type AppRouter = typeof appRouter
