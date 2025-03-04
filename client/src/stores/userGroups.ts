import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type { GroupData, GroupMember, GroupsPublic} from '@server/shared/types'
import { setErrorMessage } from '@/utils/error'

export interface UserGroups {
  groupId: number
  role: string
  userId: number
}

export interface GroupsState {
  userGroups: GroupsPublic[] | null
  activeGroup: GroupsPublic | null
  userMembership: GroupMember | null
  groupMembers: GroupMember[] | null
  groupData: GroupData | null
}

export const useUserGroupsStore = defineStore('group', {
  state: (): GroupsState => ({
    userGroups: null,
    userMembership: null,
    activeGroup: null,
    groupMembers: null,
    groupData: null,
  }),

  getters: {
    isInGroup: (state) => !!state.activeGroup,
    isAdmin: (state) => state.userMembership?.role === 'Admin',
    hasPoints: (state) => state.userMembership?.points !== null,
  },

  actions: {
    async fetchUserGroups() {
      try {
        const data = await trpc.groups.getUserGroups.query()
        this.userGroups = data.length ? data : null

        return data
      } catch (error) {
        console.error('Failed to fetch user groups:', error)
      }
    },
    async fetchGroupData() {
      try {
        const groupId = this.activeGroup?.id

        if (!groupId) throw new Error('Missing group id')

        const data = await trpc.groups.getGroupMembersAndRewards.query({ groupId })

        if (!data) return
        this.groupData = data
        this.groupMembers = data.members

        return data
      } catch (error) {
        console.error('Failed to fetch user groups data:', error)
      }
    },

    async createNewGroup(groupName: string) {
      try {
        const newGroup: GroupsPublic = await trpc.groups.create.mutate({ name: groupName })
        if (this.userGroups) {
          this.userGroups.push(newGroup)
        } else {
          this.userGroups = [newGroup]
        }
      } catch (error) {
        setErrorMessage({messageKey: 'create', message: 'group'})
        console.error('Failed to create new group:', error)
      }
    },
    async removeUserFromGroup(userId?: number) {
      try {
        const userIdToRemove = userId || this.userMembership?.id
        const groupId = this.activeGroup?.id
        if (userIdToRemove && groupId) {
          await trpc.groups.removeUser.mutate({ userId: userIdToRemove, groupId })
          await trpc.points.deletePoints.mutate({ groupId })
        }
      } catch (error) {
        setErrorMessage({message: 'Failed to remove user from group. Please try again.'})
        console.error('Failed to remove user from group:', error)
      }
    },
    async deleteGroup() {
      try {
        const groupId = this.activeGroup?.id
        if (groupId) {
          await trpc.groups.deleteGroup.mutate({ groupId })
        }
      } catch (error) {
        setErrorMessage({messageKey: 'delete', message:`${this.activeGroup?.name}` || 'group'})
        console.error('Failed to create new group:', error)
      }
    },
    async inviteUser(email: string) {
      try {
        const groupId = this.activeGroup?.id
        if (!groupId) throw new Error('No group id')

        const invitation = await trpc.groups.inviteUser.mutate({ groupId, email })

        return invitation
      } catch (error) {
        setErrorMessage({message:'Failed to invite user'})
        console.error('Failed to invite user:', error)
      }
    },
    async fetchUserMembershipInfo(userId?: number) {
      try {
        const groupId = this.activeGroup?.id

        if (groupId) {
          const data = await trpc.groups.getMembershipInfo.query({ userId, groupId })
          this.userMembership = data
        }
      } catch (error) {
        console.error('Failed to fetch user membership data:', error)
      }
    },
  },
  persist: {
    storage: sessionStorage,
    pick: ['activeGroup'],
  },
})

export type UserGroupsStore = ReturnType<typeof useUserGroupsStore>
