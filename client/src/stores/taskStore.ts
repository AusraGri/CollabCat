import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type {
InsertTaskData,
TaskUpdateData,
} from '@server/shared/types'

interface TasksState {
  tasks: any | null

}
export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    tasks: null,
  }),

  getters: {
    isTasks: (state: TasksState): boolean =>
      !!state.tasks
  },
  actions: {
    async getDueTasks(date: string) {
      try {
        const tasks = await trpc.tasks.getDueTasks.query({date})
        this.tasks = tasks
        return tasks
      } catch (error) {
        throw new Error(`Failed to fetch tasks: ${error}`)
      }
    },
    async getDuePersonalTasks(date: string) {
      try {
        const tasks = await trpc.tasks.getDuePersonalTasks.query({date})
        this.tasks = tasks
        return tasks
      } catch (error) {
        throw new Error(`Failed to fetch tasks: ${error}`)
      }
    },
    async getDueGroupTasks(date: string, groupId:number) {
      try {
        const tasks = await trpc.tasks.getDueGroupTasks.query({groupId, date})
        this.tasks = tasks
        return tasks
      } catch (error) {
        throw new Error(`Failed to fetch tasks: ${error}`)
      }
    },
    async getGroupTasks(groupId: number) {
      try {
        this.tasks = await trpc.tasks.getTasks.query({groupId})
      } catch (error) {
        throw new Error('Failed to fetch group tasks')
      }
    },
    async createTask(taskData: InsertTaskData) {
      try {
        const newTask = await trpc.tasks.createTask.mutate(taskData)

        return newTask
      } catch (error) {
        throw new Error(`Failed to save new task: ${error}`)
      }
    },
    async updateTask(taskData: TaskUpdateData ) {
      try {
        const updatedTask = await trpc.tasks.update.mutate(taskData)

        return updatedTask
      } catch (error) {
        throw new Error(`Failed to update task: ${error}`)
      }
    },
    async deleteTask(taskId: number) {
      try {
      const result =  await trpc.tasks.deleteTask.mutate({taskId})

      return result
      } catch (error) {
        throw new Error(`Failed to delete task: ${error}`)
      }
    },
  },
})

export type TasksStore = ReturnType<typeof useTasksStore>
