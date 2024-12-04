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
    user: null, // Initial state
  }),

  getters: {
    // Example getter to check if the user is logged in
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    // Fetch user data from the server and store it
    async fetchUserData() {
      try {
        const data = await trpc.user.getUserProfile.query() // Fetch from your API
        this.user = data
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    },

    // Update the name locally and perform the actual update in the background
    updateUserName(newName: string) {
      if (!this.user) return
      this.user.username = newName

      // Perform background update
      this.saveUserChanges({ username: newName })
    },

    // Update the picture locally and perform the actual update in the background
    updateUserPicture(newPicture: string) {
      if (!this.user) return
      this.user.picture = newPicture

      // Perform background update
      this.saveUserChanges({ picture: newPicture })
    },

    // Save changes to the database
    async saveUserChanges(changes: UserUpdate) {
      try {
        // Assume there's an API endpoint to update user data
        await trpc.user.updateUser.mutate(changes) // Use your actual mutation endpoint
      } catch (error) {
        console.error('Failed to save user changes:', error)
      }
    },

    // Clear user data (e.g., on logout)
    clearUser() {
      this.user = null
    },
  },
})
