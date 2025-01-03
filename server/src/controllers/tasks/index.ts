import { router } from '@server/trpc'
import create from './create'
import get from './getTasks'
import getDueTasks from './dueTask'
import taskCompletion from './taskCompletion'
import update from './updateTask'
import getAllTasks from './getAllTasks'
import createTask from './createTask'

export default router({
  create,
  get,
  getDueTasks,
  taskCompletion,
  update,
  getAllTasks,
  createTask,
})
