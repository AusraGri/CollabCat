import { router } from '@server/trpc'
import create from './create'
import getRewards from './getRewards'

export default router({
  // routes for rewards
  create,
  getRewards
})
