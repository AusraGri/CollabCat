import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type { InsertTaskData, TaskUpdateData, TaskData } from '@server/shared/types'
import { setErrorMessage } from '@/utils/error'

export interface TasksState {
  tasks: TaskData[]
}
export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    tasks: [],
  }),

  getters: {
    isTasks: (state: TasksState): boolean => !!state.tasks.length,
  },
  actions: {
    async getDueTasks(date: Date) {
      try {
        const tasks = await trpc.tasks.getDueTasks.query({ date })
        this.tasks = tasks
        return tasks
      } catch (error) {
        setErrorMessage({ messageKey: 'read', message: 'your due tasks' })
        throw new Error(`Failed to fetch tasks: ${error}`)
      }
    },
    async getDuePersonalTasks(date: Date, noGroup?: boolean) {
      try {
        const tasks = await trpc.tasks.getDuePersonalTasks.query({ date })
        if (noGroup) {
          this.tasks = tasks.filter((task) => task.groupId === null)
        } else {
          this.tasks = tasks
        }
        return this.tasks
      } catch (error) {
        setErrorMessage({ messageKey: 'read', message: 'your due personal tasks' })
        throw new Error(`Failed to fetch tasks: ${error}`)
      }
    },
    async getDueGroupTasks(date: Date, groupId: number, userId?: number) {
      try {
        const tasks = await trpc.tasks.getDueGroupTasks.query({ groupId, date, userId })
        this.tasks = tasks
        return tasks
      } catch (error) {
        setErrorMessage({ messageKey: 'read', message: 'your due group tasks' })
        throw new Error(`Failed to fetch tasks: ${error}`)
      }
    },
    async getGroupTasks(groupId: number) {
      try {
        this.tasks = await trpc.tasks.getTasks.query({ groupId })
      } catch (error) {
        setErrorMessage({ messageKey: 'read', message: 'your group tasks' })
        throw new Error('Failed to fetch group tasks')
      }
    },
    async getPersonalTasks(userId: number) {
      try {
        const tasks = await trpc.tasks.getTasks.query({ createdByUserId: userId })
        this.tasks = tasks.filter((task) => task.groupId === null)

        return this.tasks
      } catch (error) {
        setErrorMessage({ messageKey: 'read', message: 'your personal tasks' })
        throw new Error('Failed to fetch group tasks')
      }
    },
    async createTask(taskData: InsertTaskData) {
      try {
        const newTask = await trpc.tasks.createTask.mutate(taskData)
        this.tasks.push(newTask)

        return newTask
      } catch (error) {
        setErrorMessage({ messageKey: 'create', message: 'task' })
        throw new Error(`Failed to save new task: ${error}`)
      }
    },
    async updateTask(taskData: TaskUpdateData) {
      try {
        const updatedTask = await trpc.tasks.updateTask.mutate(taskData)

        if (this.isTasks) {
          this.tasks = this.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        }

        return updatedTask
      } catch (error) {
        setErrorMessage({ messageKey: 'update', message: `task ${taskData.task.title}` })
        throw new Error(`Failed to update task: ${error}`)
      }
    },
    async deleteTask(taskId: number) {
      try {
        const result = await trpc.tasks.deleteTask.mutate({ taskId })

        if (result && this.isTasks) {
          this.tasks = this.tasks.filter((task) => task.id !== taskId)
        }

        return result
      } catch (error) {
        const task = this.tasks.find((task) => task.id === taskId)
        setErrorMessage({ messageKey: 'delete', message: `${task?.title}` || 'task' })
        throw new Error(`Failed to delete task: ${error}`)
      }
    },
    async updateTaskCompletion(taskData: { id: number; isCompleted: boolean; instanceDate: Date }) {
      try {
        await trpc.tasks.taskCompletion.mutate(taskData)
        const [updatedTask] = await trpc.tasks.getTasks.query({ id: taskData.id })

        if (this.isTasks) {
          this.tasks = this.tasks.map(
            (task: TaskData): TaskData => (task.id === updatedTask.id ? updatedTask : task)
          )
        }
      } catch (error) {
        const task = this.tasks.find((task) => task.id === taskData.id)
        setErrorMessage({
          messageKey: 'update',
          message: `${task?.title} completion status` || 'task completion status',
        })
        throw new Error(`Failed to update task completion: ${error}`)
      }
    },
  },
})

export type TasksStore = ReturnType<typeof useTasksStore>
