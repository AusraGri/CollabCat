import config from '@server/config'
import { getAuth0Token } from './getManagementAuthToken'

/**
 * Deletes a user from Auth0 using their Auth0 user ID.
 *
 * This function:
 * - Retrieves a management API token using `getAuth0Token()`
 * - Sends a DELETE request to the Auth0 Management API
 * - Throws an error if the request fails or the response is not OK
 *
 * Requirements:
 * - The `getAuth0Token` function must return a valid management token
 * - `config.auth0.domain` should point to your Auth0 tenant (e.g. `my-app.us.auth0.com`)
 *
 * @param {string} auth0UserId - The ID of the Auth0 user to delete (e.g. `auth0|abc123`).
 * @throws {Error} Throws an error if the user could not be deleted.
 */
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
