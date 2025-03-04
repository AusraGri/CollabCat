import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type { PointsPublic } from '@server/shared/types'
import { setErrorMessage } from '@/utils/error'

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
        throw new Error('Failed to set user points')
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
        setErrorMessage({message: 'Failed to enable user points. Please try again'})
        throw new Error('Failed to enable user points')
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
        setErrorMessage({message: 'Failed to disable user points. Please try again'})
        throw new Error('Failed to disable user points')
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
        throw new Error('Failed to change user points')
      }
    },

    async claimPoints(param: { taskId: number; taskInstanceDate: Date; points: number }) {
      const { taskId, taskInstanceDate, points } = param
      try {
        if (!this.isPointsEnabled) return

        const isClaimed = await trpc.points.isUserClaimedPoints.query({ taskId, taskInstanceDate })

        if (isClaimed) return

        await this.alterPoints('+', points)

        await trpc.points.addClaimedPoints.mutate({ taskId, taskInstanceDate })
      } catch (error) {
        throw new Error('Failed to claim points')
      }
    },
  },
})

export type PointsStore = ReturnType<typeof usePointsStore>
