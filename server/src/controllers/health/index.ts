import { router } from '@server/trpc'
import health from './healthCheck'

export default router({
  health,
})
