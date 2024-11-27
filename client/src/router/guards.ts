import { useAuth0 } from '@auth0/auth0-vue'

export const authenticate = () => {
  const {isAuthenticated} = useAuth0()
  if (!isAuthenticated) return { name: 'Login' }

  return true
}
