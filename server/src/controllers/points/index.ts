import { router } from '@server/trpc'
import createPersonalPoints from './createPersonal'
import alterPoints from './alterPoints'
import deletePoints from './deletePersonal'
import createGroupPoints from './createGroupPoints'
import getUserPoints from './getUserPoints'
import isUserClaimedPoints from './userClaimedPoints'
import addClaimedPoints from './addClaimedPoints'

export default router({
  // routes for points
  createPersonalPoints,
  alterPoints,
  deletePoints,
  createGroupPoints,
  getUserPoints,
  isUserClaimedPoints,
  addClaimedPoints
})
