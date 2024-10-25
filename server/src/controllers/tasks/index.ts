import { router } from '@server/trpc'
import create from './create'
import get from './getTasks'

export default router({
// routes for tasks
create,
get
})