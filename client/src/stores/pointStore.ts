import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type { PointsPublic } from '@server/shared/types'

interface PointsState {
  pointsData: PointsPublic | null
  isEnabled: boolean
}

export const usePointsStore = defineStore('points', {
  state: (): PointsState => ({
    pointsData: null,
    isEnabled: false,
  }),

  getters: {
    isPointsEnabled: (state: PointsState): boolean => state.isEnabled,
    userPoints: (state: PointsState): number => (state.pointsData ? state.pointsData.points : 0),
  },
  actions: {
    async managePoints(groupId?: number) {
      try {
        const points = await trpc.points.getUserPoints.query({ groupId })
        this.isEnabled = !!points
        if (points) {
          this.pointsData = points
        }
      } catch (error) {
        throw new Error('Failed to get points data')
      }
    },
    async setPoints(points: number) {
      try {
        if (this.pointsData) {
          this.pointsData.points = points
        }
      } catch (error) {
        console.error('Failed to set user points:', error)
      }
    },
    async enablePoints(groupId?: number): Promise<void> {
      try {
        const points = await trpc.points.createPoints.mutate({
          groupId,
        })

        this.isEnabled = true
        this.pointsData = points
      } catch (error) {
        console.error('Failed to set user points:', error)
      }
    },
    async disablePoints(): Promise<void> {
      const groupId = this.pointsData?.groupId || undefined
      try {
        await trpc.points.deletePoints.mutate({
          groupId,
        })

        this.isEnabled = false
        this.pointsData = null
      } catch (error) {
        console.error('Failed to set user points:', error)
      }
    },
    async alterPoints(action: '+' | '-', points: number): Promise<void> {
      const groupId = this.pointsData?.groupId || undefined
      try {
        const result = await trpc.points.alterPoints.mutate({
          groupId,
          action,
          points,
        })

        this.isEnabled = !!result
        this.pointsData = result
      } catch (error) {
        console.error('Failed to set user points:', error)
      }
    },
  },
})

export type PointsStore = ReturnType<typeof usePointsStore>
