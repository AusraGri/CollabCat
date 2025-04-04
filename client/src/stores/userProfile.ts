import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type { PublicInvitation, UserPublic } from '@server/shared/types'
import { setErrorMessage } from '@/utils/error'

export interface UserState {
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

    async updateUserName(newName: string) {
      if (!this.user) return
      await this.saveUserChanges(newName)

      this.user.username = newName
    },

    async deleteUser() {
      try {
        await trpc.user.deleteUser.mutate()
        this.clearUser()
      } catch (error) {
        setErrorMessage({ messageKey: 'delete', message: `${this.user?.username}` || 'user' })
        console.log(error)
      }
    },

    async saveUserChanges(username: string) {
      try {
        const updatedUser = await trpc.user.updateUser.mutate({ username })
        this.user = updatedUser
      } catch (error) {
        setErrorMessage({ messageKey: 'update', message: 'username' })
        throw error
      }
    },

    clearUser() {
      this.user = null
    },
  },
})

export type UserStore = ReturnType<typeof useUserStore>
