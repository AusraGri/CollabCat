import { router } from '@server/trpc'
import createPersonalPoints from './createPersonal'
import alterPoints from './alterPoints'
import deletePoints from './deletePoints'
import createGroupPoints from './createGroupPoints'
import getUserPoints from './getUserPoints'
import isUserClaimedPoints from './userClaimedPoints'
import addClaimedPoints from './addClaimedPoints'
import createPoints from './createPoints'

export default router({
  // routes for points
  createPersonalPoints,
  createPoints,
  alterPoints,
  deletePoints,
  createGroupPoints,
  getUserPoints,
  isUserClaimedPoints,
  addClaimedPoints
})
