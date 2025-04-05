import dotenv from 'dotenv'

dotenv.config()

/**
 * Retrieves a management API token from Auth0 using the Client Credentials flow.
 *
 * This function:
 * - Sends a POST request to Auth0's `/oauth/token` endpoint
 * - Uses client ID, client secret, and audience from environment variables
 * - Returns the `access_token` needed for authenticated API requests (e.g. deleting users)
 *
 * Make sure the Auth0 application is:
 * - Of type "Machine to Machine"
 * - Authorized to access the Management API with the correct scopes (e.g., `delete:users`)
 *
 * @returns {Promise<string>} - A Promise that resolves to the access token string.
 * @throws {Error} - Throws an error if the token could not be retrieved.
 */
export const getAuth0Token = async (): Promise<string> => {
  try {
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          grant_type: 'client_credentials',
        }),
      }
    )
    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    throw new Error('Failed to retrieve Auth0 token')
  }
}
