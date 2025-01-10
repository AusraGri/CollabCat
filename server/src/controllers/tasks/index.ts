import { router } from '@server/trpc'
import getTasks from './getTasks'
import getDueTasks from './dueTask'
import taskCompletion from './taskCompletion'
import update from './updateTask'
import getAllTasks from './getAllTasks'
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
  getAllTasks,
  createTask,
  deleteTask,
})
