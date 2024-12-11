import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type { PublicInvitation } from '@server/shared/types'

interface UserPublic {
  username: string | null
  email: string
  picture: string | null
  id: number
}

interface UserUpdate {
  picture?: string
  username?: string
}
interface UserState {
  user: UserPublic | null // Stores user information
  invitations: PublicInvitation[] | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    invitations: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    async fetchUserData() {
      try {
        const data = await trpc.user.getUserProfile.query() // Fetch from your API
        this.user = data

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

    async deleteUser() {
      await trpc.user.deleteUser.mutate()
      this.clearUser()
    },

    async saveUserChanges(changes: UserUpdate) {
      try {
        this.user = await trpc.user.updateUser.mutate(changes)
      } catch (error) {
        console.error('Failed to save user changes:', error)
      }
    },

    clearUser() {
      this.user = null
    },
  },
})
