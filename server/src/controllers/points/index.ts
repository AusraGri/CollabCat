import { router } from '@server/trpc'
import alterPoints from './alterPoints'
import deletePoints from './deletePoints'
import getUserPoints from './getUserPoints'
import isUserClaimedPoints from './isUserClaimedPoints'
import addClaimedPoints from './addClaimedPoints'
import createPoints from './createPoints'

export default router({
  createPoints,
  alterPoints,
  deletePoints,
  getUserPoints,
  isUserClaimedPoints,
  addClaimedPoints,
})
