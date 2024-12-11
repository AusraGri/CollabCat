import { router } from '@server/trpc'
import create from './create'
import remove from './remove'
import inviteUser from './inviteUser'
import removeUser from './removeUser'
import getUserGroups from './getUserGroups'
import getMembershipInfo from './getUserMembershipInfo'
import getGroupMembers from './getGroupMembers'
import getGroup from './getGroup'
import addUserToGroup from './addUserToGroup'
import getGroupData from './getGroupData'

export default router({
  create,
  remove,
  inviteUser,
  removeUser,
  getUserGroups,
  getMembershipInfo,
  getGroupMembers,
  getGroup,
  addUserToGroup,
  getGroupData
})
