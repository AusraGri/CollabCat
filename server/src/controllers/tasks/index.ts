import { router } from '@server/trpc'
import getTasks from './getTasks'
import getDueTasks from './dueTask'
import taskCompletion from './taskCompletion'
import update from './updateTask'
import getAllTasks from './getAllTasks'
import createTask from './createTask'
import deleteTask from './deleteTask'

export default router({

  getTasks,
  getDueTasks,
  taskCompletion,
  update,
  getAllTasks,
  createTask,
  deleteTask,
})
