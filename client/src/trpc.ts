import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
// @ts-ignore - importing through a direct path propagates types faster
import type { AppRouter } from '@server/shared/trpc'
import { apiBase } from '@/config'
import SuperJSON from 'superjson'
import { useAuthStore } from './stores/authStore'

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    httpBatchLink({
      url: apiBase,

      headers: () => {
        const authStore = useAuthStore()
        const accessToken = authStore.authToken

        return {
          Authorization: `Bearer ${accessToken}`,
        }
      },
    }),
  ],
})
