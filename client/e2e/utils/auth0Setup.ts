import * as fs from 'fs'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { apiOrigin, apiPath } from './config'
import type { AppRouter } from '@server/shared/trpc'
import superjson from 'superjson'
import { Page } from '@playwright/test'

const TOKEN_FILE = './auth0-token.json'

let accessToken: string | null = null

const {
  VITE_AUTH0_DOMAIN,
  VITE_AUTH0_CLIENT_ID,
  VITE_AUTH0_CLIENT_SECRET,
  VITE_AUTH0_AUDIENCE,
  VITE_AUTH0_TEST_EMAIL,
  VITE_AUTH0_TEST_PASSWORD,
} = process.env


export async function loginTestUser (page: Page) {
    await page.goto('http://localhost:5174/');
    await page.locator('[data-test="login-button"]').click();
    await page.getByLabel('Email address').click();
    await page.getByLabel('Email address').fill('e2e-test@email.com
    await page.getByLabel('Email address').click({
      button: 'right'
    });');
    await page.getByLabel('Password').click();
    await page.getByLabel('Password').fill('E2E-test');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    return true
}
export async function setupAuth0TestUser() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const savedToken = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'))
      const now = Math.floor(Date.now() / 1000)

      if (savedToken.expires_at > now) {
        return savedToken.access_token
      }
    }
    await page.getByLabel('Email address').fill('e2e-test@email.com');
    await page.getByLabel('Password').click();
    await page.getByLabel('Password').fill('E2E-test');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    const authResponse = await fetch(`https://${VITE_AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          client_id: VITE_AUTH0_CLIENT_ID,
          client_secret: VITE_AUTH0_CLIENT_SECRET,
          audience: VITE_AUTH0_AUDIENCE,
          grant_type: 'password',
          username: VITE_AUTH0_TEST_EMAIL,
          password: VITE_AUTH0_TEST_PASSWORD,
          scope: 'openid profile email',
        }),
    })


    if (!authResponse.ok) {
      throw new Error(`Failed to get Auth0 token: ${authResponse.statusText}`)
    }

    const data = await authResponse.json()
    const token = data.access_token
    const expires_at = Math.floor(Date.now() / 1000) + data.expires_in

    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ access_token: token, expires_at }))

    const testUser = {
      auth0Token: token,
      username: VITE_AUTH0_TEST_EMAIL,
      email: VITE_AUTH0_TEST_EMAIL,
    }
    const user = await trpc.user.signupAuth.mutate(testUser)
    accessToken = token

    return {user, token}
  } catch (error) {
    console.error('Error while setting up test user:', error) 
    throw new Error(`Error while setting up test user: ${error}`)
  }
}


export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${apiOrigin}${apiPath}`,

      // send the access token with every request
      headers: () => {
        return {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
      },
    }),
  ],
})