import { router } from '@server/trpc'
import getTasks from './getTasks'
import getDueTasks from './getDueTask'
import taskCompletion from './taskCompletion'
import update from './updateTask'
import createTask from './createTask'
import deleteTask from './deleteTask'
import getDueGroupTasks from './dueGroupTasks'
import getDuePersonalTasks from './duePersonalTasks'

export default router({
  getTasks,
  getDueTasks,
  getDueGroupTasks,
  getDuePersonalTasks,
  taskCompletion,
  update,
  createTask,
  deleteTask,
})
