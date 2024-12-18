import { router } from '@server/trpc'
import create from './create'
import getRewards from './getRewards'
import deleteReward from './delete'
import update from './update'

export default router({
  // routes for rewards
  create,
  getRewards,
  deleteReward,
  update
})
