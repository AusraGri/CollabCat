import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userProfile'
import { useAuthService } from '@/services/auth0'

export const authenticate = async () => {
  // const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const { isAuth, getToken } = useAuthService()

  const authStore = useAuthStore()
  const userStore = useUserStore()

  // const token = await getAccessTokenSilently()
  const token = await getToken()
  authStore.authToken = token

  if (!isAuth || !authStore.authToken) return { name: 'Login' }

  await userStore.fetchUserData()

  return true
}
