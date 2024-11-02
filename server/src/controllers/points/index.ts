import { router } from '@server/trpc'
import create from './create'
import alter from './alterPoints'
import deletePoints from './delete'

export default router({
// routes for points
create,
alter,
deletePoints
})