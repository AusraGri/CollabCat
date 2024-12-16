import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type {
  PublicInvitation,
  PublicReward,
  GroupData,
  InsertableReward,
  GroupMember,
} from '@server/shared/types'
type GroupsPublic = {
  id: number
  name: string
  createdByUserId: number
}

export interface UserGroups {
  groupId: number
  role: string
  userId: number
}


export type ActiveGroup = Omit<GroupsPublic, 'createdByUserId'>
interface GroupsState {
  userGroups: GroupsPublic[] | null
  activeGroup: ActiveGroup | null
  userMembership: any | null
  groupMembers: GroupMember[] | null
  rewards: Omit<PublicReward, 'groupId'>[] | null
  groupData: GroupData | null
}

export const useUserGroupsStore = defineStore('group', {
  state: (): GroupsState => ({
    userGroups: null,
    userMembership: null,
    activeGroup: null,
    groupMembers: null,
    rewards: null,
    groupData: null,
  }),

  getters: {
    isInGroup: (state) => !!state.activeGroup,
  },

  actions: {
    async fetchUserGroups() {
      try {
        const data = await trpc.groups.getUserGroups.query()
        this.userGroups = data

        return data
      } catch (error) {
        console.error('Failed to fetch user groups data:', error)
      }
    },
    async fetchGroupData() {
      try {
        const groupId = this.activeGroup?.id

        if (!groupId) throw new Error('Missing group id')

        const data = await trpc.groups.getGroupData.query({ groupId })

        if (!data) return
        this.groupData = data
        this.groupMembers = data.members
        this.rewards = data.rewards || null

        return data
      } catch (error) {
        console.error('Failed to fetch user groups data:', error)
      }
    },

    async createNewGroup(groupName: string) {
      try {
        const newGroup = await trpc.groups.create.mutate({ name: groupName })
        this.userGroups?.push(newGroup)
      } catch (error) {
        console.error('Failed to create new group:', error)
      }
    },
    async createNewReward(rewardData: InsertableReward) {
      if(!this.activeGroup) throw new Error('Group id not provided')

      const newReward = {
        groupId: this.activeGroup.id,
        ...rewardData,
      }
      try {
        const reward = await trpc.rewards.create.mutate(newReward)
        this.rewards?.push(reward)
      } catch (error) {
        console.error('Failed to create new group:', error)
      }
    },
    // async getGroupMembers() {
    //   try {
    //     const groupId = this.activeGroup?.id
    //     if (groupId) {
    //       const members = await trpc.groups.getGroupMembers.query({ groupId })
    //       this.groupMembers = members
    //     }
    //   } catch (error) {
    //     console.error('Failed to create new group:', error)
    //   }
    // },
    async inviteUser(email: string) {
      console.log('store trying to invite')
      try {
        const groupId = this.activeGroup?.id
        if (!groupId) throw new Error('No group id')

        const invitation = await trpc.groups.inviteUser.mutate({ groupId, email })

        return invitation
      } catch (error) {
        console.error('Failed to invite user:', error)
      }
    },
    // fetch active user group information with role and permissions
    async fetchUserMembershipInfo(userId: number) {
      try {
        const groupId = this.activeGroup?.id

        if (groupId) {
          const data = await trpc.groups.getMembershipInfo.query({ userId, groupId }) // Fetch from your API
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
