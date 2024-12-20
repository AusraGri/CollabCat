import { useAuth0 } from '@auth0/auth0-vue'
import { trpc } from '@/trpc'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authToken: null as string | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.authToken,
  },
  actions: {
    async setAuthToken(token: string) {
      try {
        if (!token) throw new Error('Missing token')
        this.authToken = token
      } catch (error) {
        throw new Error('Failed to get auth token')
      }
    },
    logout() {
      this.authToken = null
    },
  },
})

export type AuthStore = ReturnType<typeof useAuthStore>