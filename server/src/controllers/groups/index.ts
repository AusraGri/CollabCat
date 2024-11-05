import { router } from '@server/trpc'
import create from './create'
import remove from './remove'
import inviteUser from './inviteUser'
import removeUser from './removeUser'

export default router({
// routes for tasks
create,
remove,
inviteUser,
removeUser
})