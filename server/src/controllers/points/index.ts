import { router } from '@server/trpc'
import create from './createPersonal'
import alter from './alterPoints'
import deletePoints from './deletePersonal'
import createGroupPoints from './createGroupPoints'
import getUserPoints from './getUserPoints'
import isUserClaimedPoints from './userClaimedPoints'

export default router({
  // routes for points
  create,
  alter,
  deletePoints,
  createGroupPoints,
  getUserPoints,
  isUserClaimedPoints
})
