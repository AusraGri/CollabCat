import { router } from '@server/trpc'
import create from './create'
import remove from './remove'

export default router({
// routes for tasks
create,
remove
})