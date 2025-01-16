import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type {
  PublicInvitation,
  CategoriesPublic,
  TaskData,
  UserPublic
} from '@server/shared/types'

interface UserUpdate {
  picture?: string
  username?: string
}
interface UserState {
  user: UserPublic | null
  invitations: PublicInvitation[] | null
  categories: CategoriesPublic[] | null
  tasks: TaskData[] | null
  points: number | null
  isPointsEnabled: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    invitations: null,
    categories: null,
    tasks: null,
    points: null,
    isPointsEnabled: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    async fetchUserData() {
      try {
        const data = await trpc.user.getUserProfile.query()
        const points = await trpc.points.getUserPoints.query({})

        if(points){
          this.isPointsEnabled = true
          this.points = points.points
        }
        this.user = data
        this.categories = await trpc.categories.getUserCategories.query()

        return data
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    },
    async fetchInvitations() {
      try {
        const data = await trpc.invitations.getGroupInvitations.query()
        this.invitations = data

        return data
      } catch (error) {
        console.error('Failed to fetch user groups data:', error)
      }
    },
    async deleteInvitation(invitation: PublicInvitation) {
      try {
        this.invitations = this.invitations?.filter((inv) => inv != invitation) || null

        await trpc.invitations.deleteInvitation.mutate({
          invitationToken: invitation.invitationToken,
        })
      } catch (error) {
        console.log('error while deleting invitation')
      }
    },

    async fetchUserTasks() {
      try {
        const userId = this.user?.id

        if (!userId) throw new Error('Missing user info')

        const tasks = await trpc.tasks.getTasks.query({ createdByUserId: userId })

        this.tasks = tasks.filter((task) => task.groupId === null)
      } catch (error) {
        console.log(`Failed to fetch user tasks: ${error}`)
      }
    },

    updateUserName(newName: string) {
      if (!this.user) return
      this.user.username = newName

      this.saveUserChanges({ username: newName })
    },

    updateUserPicture(newPicture: string) {
      if (!this.user) return
      this.user.picture = newPicture

      this.saveUserChanges({ picture: newPicture })
    },

    updateUserPoints(points: number) {
      this.points = points
    },

    async deleteUser() {
      await trpc.user.deleteUser.mutate()
      this.clearUser()
    },

    async saveUserChanges(changes: UserUpdate) {
      try {
        const updatedUser = await trpc.user.updateUser.mutate(changes)
        this.user = updatedUser
      } catch (error) {
        console.error('Failed to save user changes:', error)
      }
    },

    clearUser() {
      this.user = null
    },
  },
})

export type UserStore = ReturnType<typeof useUserStore>
