import { router } from '@server/trpc'
import create from './create'
import remove from './remove'
import inviteUser from './inviteUser'
import removeUser from './removeUser'
import getUserGroups from './getUserGroups'

export default router({
  // routes for groups
  create,
  remove,
  inviteUser,
  removeUser,
  getUserGroups,
})
