import dotenv from 'dotenv'

dotenv.config()

export const getAuth0Token = async () => {
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
