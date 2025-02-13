import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type { PublicInvitation, UserPublic } from '@server/shared/types'

interface UserState {
  user: UserPublic | null
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
        const data = await trpc.user.getUserProfile.query()

        if (!data) throw new Error('Failed to find user data')

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

      this.saveUserChanges(newName)
    },

    async deleteUser() {
      await trpc.user.deleteUser.mutate()
      this.clearUser()
    },

    async saveUserChanges(username: string) {
      try {
        const updatedUser = await trpc.user.updateUser.mutate({ username })
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
