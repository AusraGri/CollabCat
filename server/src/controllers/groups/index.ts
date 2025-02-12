import { router } from '@server/trpc'
import create from './createGroup'
import deleteGroup from './deleteGroup'
import inviteUser from './inviteUser'
import removeUser from './removeUser'
import getUserGroups from './getUserGroups'
import getMembershipInfo from './getUserMembershipInfo'
import getGroupMembers from './getGroupMembers'
import getGroupInfo from './getGroupInfo'
import addUserToGroup from './addUserToGroup'
import getGroupMembersAndRewards from './getGroupMembersAndRewards'

export default router({
  create,
  deleteGroup,
  inviteUser,
  removeUser,
  getUserGroups,
  getMembershipInfo,
  getGroupMembers,
  getGroupInfo,
  addUserToGroup,
  getGroupMembersAndRewards,
})
