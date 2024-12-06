import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
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
interface GroupsState {
    userGroups: GroupsPublic[] | null 
    activeGroup: UserGroups | null
  }

export const useUserGroupsStore = defineStore('group', {
  state: () :GroupsState => ({
    userGroups:  null,
    activeGroup: null
  }),

  getters: {
    isInGroup: (state) => !!state.userGroups,
  },

  actions: {
    async fetchUserGroupsData() {
      try {
        const data = await trpc.groups.getUserGroups.query() 
        this.userGroups = data
      } catch (error) {
        console.error('Failed to fetch user groups data:', error)
      }
    },
    async createNewGroup(groupName: string ) {
      try {
        const newGroup = await trpc.groups.create.mutate({name:groupName}) 
        this.userGroups?.push(newGroup)
      } catch (error) {
        console.error('Failed to create new group:', error)
      }
    },
    // fetch active user group information with role and permissions
    async fetchActiveGroup(groupId: number) {
      try {
        const data = await trpc.groups.getUserGroups.query() // Fetch from your API
        this.userGroups = data
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    },
  },
})

export type UserGroupsStore = ReturnType<typeof useUserGroupsStore>
