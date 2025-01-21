import { useAuth0, createAuth0 } from '@auth0/auth0-vue'

export const auth0 = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  cacheLocation: 'localstorage',
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
  },
})

export const useAuthService = () => {

  const { loginWithRedirect, getAccessTokenSilently, user, isAuthenticated, logout } = useAuth0()

  const login = async (targetPath: string = '/') => {
    try {
      await loginWithRedirect({
        appState: { target: targetPath },
        authorizationParams: { prompt: 'login' },
      })
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Login process failed')
    }
  }

  const signup = async (targetPath: string = '/') => {
    try {
      await loginWithRedirect({
        appState: { target: targetPath },
        authorizationParams: { prompt: 'login', screen_hint: 'signup' },
      })
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Login process failed')
    }
  }

  const getUserData = async () => {
    if (!isAuthenticated.value) throw new Error('User is not authenticated in service')

    if (!user.value?.email || !user.value?.name || !user.value?.picture)
      throw new Error('Missing user data')

    const idToken = await getAccessTokenSilently()

    const userData = {
      auth0Token: idToken,
      email: user.value.email,
      username: user.value.name,
      picture: user.value.picture,
    }

    return userData
  }

  const getToken = async () => {
    try {
      return await getAccessTokenSilently()
    } catch {
      throw new Error('Failed to retrieve token')
    }
  }

  const isAuth = isAuthenticated.value

  return { login, signup, getUserData, getToken, logout, isAuth }
}
