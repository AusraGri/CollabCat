import config from '@server/config'
import { getAuth0Token } from './getManagementAuthToken'

export const deleteAuth0User = async (auth0UserId: string) => {
  try {
    const token = await getAuth0Token()
    const url = `https://${config.auth0.domain}/api/v2/users/${auth0UserId}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`)
    }

  } catch (error) {
    throw new Error('Failed to delete Auth0 user')
  }
}
