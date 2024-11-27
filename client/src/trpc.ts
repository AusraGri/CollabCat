import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
// @ts-ignore - importing through a direct path propagates types faster
import type { AppRouter } from '@server/shared/trpc'
import { getStoredAccessToken } from './utils/auth'
import { apiBase } from '@/config'
import SuperJSON from 'superjson'

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    httpBatchLink({
      url: apiBase,

      headers: () => {
        const accessToken = getStoredAccessToken(localStorage)

        if (!accessToken) {
          throw new Error('Unauthorized: No token found')
        }
        // Log the headers for debugging purposes
        // console.log('Headers:', {
        //   Authorization: `Bearer ${accessToken}`,
        // })

        return {
          Authorization: `Bearer ${accessToken}`,
        }
      },
    }),
  ],
})