import { router } from '@server/trpc'
// import login from './login'
import signupAuth from './signupAuth'
import getUserById from './getUserById'
import getAssignedUserByTaskId from './assignedUserByTaskId'
import updateUser from './updateUser'
import getUserProfile from './getUserProfile'
import deleteUser from './deleteUser'

export default router({
  // login,
  signupAuth,
  getUserById,
  getAssignedUserByTaskId,
  updateUser,
  getUserProfile,
  deleteUser,
})
