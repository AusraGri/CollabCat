import { useAuth0 } from '@auth0/auth0-vue'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore, type UserStore } from '@/stores/userProfile'

export const authenticate = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const authStore = useAuthStore()
  const userStore: UserStore = useUserStore()

  try {
    const token = await getAccessTokenSilently()

    authStore.authToken = token

    if (!isAuthenticated || !authStore.authToken) {
      console.log('not authenticated')
      return next({ name: 'Login' })
    }

    await userStore.fetchUserData()

    next()
  } catch (error) {
    console.error('Error during authentication:', error)
    next({ name: 'Login' })
  }
}
