import { useAuth0 } from '@auth0/auth0-vue'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore, type UserStore } from '@/stores/userProfile'
import { useAuthService } from '@/services/auth0'

// export const authenticate = async () => {
//   // const { isAuthenticated, getAccessTokenSilently } = useAuth0()
//   const { isAuth, getToken } = useAuthService()

//   const authStore = useAuthStore()
//   const userStore = useUserStore()

//   // const token = await getAccessTokenSilently()
//   const token = await getToken()
//   authStore.authToken = token

//   if (!isAuth || !authStore.authToken) return { name: 'Login' }

//   await userStore.fetchUserData()

//   return true
// }

export const authenticate = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  console.log('Authentication in progress...')

  const { isAuth, getToken } = useAuthService()
  const authStore = useAuthStore()
  const userStore :UserStore = useUserStore()

  try {
    const token = await getToken()

    authStore.authToken = token

    if (!isAuth || !authStore.authToken) {
      console.log('Authentication failed, redirecting to login...')
      return next({ name: 'Login' })
    }

    await userStore.fetchUserData()
    console.log('User data fetched successfully')

    next()
  } catch (error) {
    console.error('Error during authentication:', error)
    next({ name: 'Login' })
  }
}
