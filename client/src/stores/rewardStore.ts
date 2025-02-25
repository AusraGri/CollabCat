import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type {
  PublicReward,
  GroupMember,
  InsertableReward,
  RewardUpdateable,
} from '@server/shared/types'

export interface RewardState {
  rewards: PublicReward[] | null

  activeUser: GroupMember | null
  claimers: GroupMember[] | null
  isRewardsEnabled: boolean
  groupId: number | null
}

export const useRewardStore = defineStore('reward', {
  state: (): RewardState => ({
    isRewardsEnabled: true,
    rewards: null,
    claimers: null,
    activeUser: null,
    groupId: null,
  }),

  getters: {
    hasClaimers: (state: RewardState): boolean =>
      state.claimers ? state.claimers.length > 0 : false,
    isGroup: (state: RewardState): boolean => !!state.groupId,
    isPersonal: (state: RewardState): boolean => (state.groupId ? false : true),
    hasRewards: (state: RewardState): boolean => (state.rewards ? state.rewards.length > 0 : false),
    isGroupAdmin: (state: RewardState): boolean =>
      state.activeUser ? state.activeUser.role === 'Admin' : false,
  },
  actions: {
    async manageGroupRewards(groupId: number) {
      try {
        const data = await trpc.groups.getGroupMembersAndRewards.query({ groupId })

        if (!data) throw new Error('Failed to initialize group rewards')
        this.groupId = data.id
        this.rewards = data.rewards ?? null
        this.claimers = data.members
        this.activeUser = await trpc.groups.getMembershipInfo.query({ groupId })
      } catch (error) {
        throw new Error('Failed to initialize group rewards')
      }
    },
    async managePersonalRewards(user: GroupMember) {
      try {
        this.groupId = null
        this.claimers = null
        const rewards: PublicReward[] = await trpc.rewards.getRewards.query({})
        this.rewards = rewards
        this.activeUser = user

        return rewards
      } catch (error) {
        throw new Error(`Failed to initialize user rewards: ${error}`)
      }
    },

    async updateReward(reward: RewardUpdateable) {
      try {
        const updatedReward = await trpc.rewards.updateReward.mutate(reward)

        this.rewards =
          this.rewards?.map((r) => (r.id === updatedReward.id ? updatedReward : r)) || null
      } catch (error) {
        throw new Error('Failed to edit reward')
      }
    },
    async deleteReward(rewardId: number) {
      try {
        await trpc.rewards.deleteReward.mutate({ rewardId })
        this.rewards = this.rewards?.filter((r) => r.id !== rewardId) || null
      } catch (error) {
        throw new Error('Failed to delete reward')
      }
    },
    async createReward(rewardData: InsertableReward) {
      const newReward = {
        groupId: this.groupId ?? undefined,
        ...rewardData,
      }
      try {
        const reward = await trpc.rewards.createReward.mutate(newReward)

        this.rewards = this.rewards ? [...this.rewards, reward] : [reward]
      } catch (error) {
        console.error('Failed to create new reward:', error)
      }
    },
    async claimReward(reward: PublicReward) {
      const rewardId = reward.id
      const groupId = reward.groupId ? reward.groupId : undefined
      try {
        await trpc.rewards.claimReward.mutate({ rewardId, groupId })

        if (reward.amount && reward.amount > 0) {
          const updateAmount = reward.amount - 1

          const updatedReward = { ...reward, amount: updateAmount }

          this.rewards =
            this.rewards?.map((r) => (r.id === updatedReward.id ? updatedReward : r)) || null
        }
      } catch (error) {
        console.error('Failed to claim reward:', error)
      }
    },
  },
})

export type RewardStore = ReturnType<typeof useRewardStore>
