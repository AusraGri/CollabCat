import { router } from '../trpc'
import user from './user'
import tasks from './tasks'
import groups from './groups'

export const appRouter = router({
// provide controllers
user,
tasks,
groups
})

export type AppRouter = typeof appRouter
