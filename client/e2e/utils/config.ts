import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from '@server/controllers'
import superjson from 'superjson'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as dotenv from 'dotenv'

export const apiOrigin = (process.env.VITE_API_ORIGIN as string) || 'http://localhost:3000'
export const apiPath = (process.env.VITE_API_PATH as string) || '/api/v1/trpc'

if (typeof apiOrigin !== 'string') {
  throw new Error('VITE_API_ORIGIN is not defined')
}

if (typeof apiPath !== 'string') {
  throw new Error('VITE_API_PATH is not defined')
}

dotenv.config()

async function getTokenFromAuthJson() {
  const authPath = path.resolve('e2e/utils/auth.json')
  const authRaw = await fs.readFile(authPath, 'utf-8')
  const authData = JSON.parse(authRaw)

  const origin = authData.origins[0]
  if (!origin) throw new Error('No origins found in auth.json')

  const tokenItem = origin.localStorage.find((item: any) => item.value.includes('access_token'))
  if (!tokenItem) throw new Error('Token not found in localStorage')

  const parsedValue = JSON.parse(tokenItem.value)

  const accessToken = parsedValue.body.access_token

  if (!accessToken) throw new Error('access_token missing in parsed value')

  return accessToken
}

export async function getTrpcClient() {
  const token = await getTokenFromAuthJson()

  if (!token) {
    throw new Error('❌ Auth token not found in auth.json')
  }

  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${apiOrigin}${apiPath}`,
        headers: () => ({
          Authorization: `Bearer ${token}`,
        }),
      }),
    ],
  })
}
