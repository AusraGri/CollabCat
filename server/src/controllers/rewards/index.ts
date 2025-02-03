import { router } from '@server/trpc'
import createReward from './createReward'
import getRewards from './getRewards'
import deleteReward from './deleteReward'
import updateReward from './updateReward'
import claimReward from './claimReward'

export default router({
  createReward,
  getRewards,
  deleteReward,
  updateReward,
  claimReward,
})
