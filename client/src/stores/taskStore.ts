import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type {
  GroupsPublic,
InsertTaskData
} from '@server/shared/types'

export type ActiveGroup = Omit<GroupsPublic, 'createdByUserId'>
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
        this.tasks = await trpc.tasks.getDueTasks.query({date})
      } catch (error) {
        throw new Error('Failed to fetch tasks')
      }
    },
    async getGroupTasks(groupId: number) {
      try {
        this.tasks = await trpc.tasks.get.query({groupId})
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
  },
})

export type TasksStore = ReturnType<typeof useTasksStore>
