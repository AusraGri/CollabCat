import { router } from '../trpc'
import user from './user'

export const appRouter = router({
// provide controllers
user
})

export type AppRouter = typeof appRouter
