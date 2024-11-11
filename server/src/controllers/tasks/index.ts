import { router } from '@server/trpc'
import create from './create'
import get from './getTasks'
import getDueTasks from './dueTask'

export default router({
// routes for tasks
create,
get,
getDueTasks
})