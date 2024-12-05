import { defineStore } from 'pinia'

import { trpc } from '@/trpc'

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
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    async fetchUserData() {
      try {
        const data = await trpc.user.getUserProfile.query() // Fetch from your API
        this.user = data
      } catch (error) {
        console.error('Failed to fetch user data:', error)
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

    async deleteUser () {
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
