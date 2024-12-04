import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import signupAuth from './signupAuth'
import getUsers from './getUsers'
import getAssignedUsers from './assignedUsers'
import updateUser from './updateUser'
import getUserProfile from './getUserProfile'

export default router({
  login,
  signup,
  signupAuth,
  getUsers,
  getAssignedUsers, 
  updateUser, 
  getUserProfile
})
