import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type { CategoriesPublic } from '@server/shared/types'

interface CategoriesState {
  categories: CategoriesPublic[]
  userCategories: CategoriesPublic[]
  groupCategories: CategoriesPublic[]
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    userCategories: [],
    groupCategories: [],
  }),

  getters: {
    isCategories: (state: CategoriesState): boolean => state.categories.length > 0,
    isUserCategories: (state: CategoriesState): boolean => state.userCategories.length > 0,
    isGroupCategories: (state: CategoriesState): boolean => state.groupCategories.length > 0,
  },
  actions: {
    async fetchAllCategories() {
      try {
        const categories = await trpc.categories.getAllRelatedCategories.query()
        this.categories = categories

        return categories
      } catch (error) {
        throw new Error(`Failed to get categories data: ${error}`)
      }
    },
    async getGroupCategories(groupId: number) {
      try {
        if (this.isCategories) {
          this.groupCategories = this.categories.filter((cat) => cat.groupId === groupId)
        }
      } catch (error) {
        console.error('Failed to get group categories :', error)
      }
    },
    async getUserCategories(): Promise<void> {
      try {
        if (this.isCategories) {
          this.userCategories = this.categories.filter((cat) => cat.groupId === null)
        }
      } catch (error) {
        console.error('Failed to set user points:', error)
      }
    },
    async createCategory(category: {
      title: string
      groupId: number | null
    }): Promise<CategoriesPublic> {
      try {
        const newCategory = await trpc.categories.createCategory.mutate(category)
        this.categories.push(newCategory)

        if (newCategory.groupId) {
          this.groupCategories.push(newCategory)
        } else {
          this.userCategories.push(newCategory)
        }

        return newCategory
      } catch (error) {
        console.error('Failed to create category:', error)
        throw error
      }
    },
    async deleteCategory(categoryId: number) {
      try {
        const result = await trpc.categories.deleteCategory.mutate({ categoryId })
        this.categories = this.categories.filter((cat) => cat.id !== categoryId)

        if (this.groupCategories) {
          this.groupCategories = this.groupCategories.filter((cat) => cat.id !== categoryId)
        } else {
          this.userCategories = this.userCategories.filter((cat) => cat.id !== categoryId)
        }

        return result
      } catch (error) {
        console.error('Failed to create category:', error)
      }
    },
  },
})

export type CategoriesStore = ReturnType<typeof useCategoriesStore>
