import { router } from '@server/trpc'
import login from './login'
import signupAuth from './signupAuth'
import getUser from './getUser'
import getAssignedUsers from './assignedUsers'
import updateUser from './updateUser'
import getUserProfile from './getUserProfile'
import deleteUser from './deleteUser'

export default router({
  login,
  signupAuth,
  getUser,
  getAssignedUsers,
  updateUser,
  getUserProfile,
  deleteUser
})
