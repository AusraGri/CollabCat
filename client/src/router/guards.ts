import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/userProfile'

export const authenticate = async () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()

  const authStore = useAuthStore()
  const userStore = useUserStore()

  const token = await getAccessTokenSilently()
  authStore.authToken = token

  if (!isAuthenticated  || !authStore.authToken) return { name: 'Login' }

  await userStore.fetchUserData()

  return true
}
