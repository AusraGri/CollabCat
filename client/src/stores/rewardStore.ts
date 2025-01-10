import { defineStore } from 'pinia'
import { trpc } from '@/trpc'
import type {
  PublicReward,
  GroupMember,
  InsertableReward,
  UserPublic,
  RewardUpdateable,
} from '@server/shared/types'

interface RewardState {
  rewards: PublicReward[] | null

  activeUser: GroupMember | null
  claimers: GroupMember[] | null

  groupId: number | null
}

export const useRewardStore = defineStore('reward', {
  state: (): RewardState => ({
    rewards: null,
    claimers: null,
    activeUser: null,
    groupId: null,
  }),

  getters: {
    hasClaimers: (state: RewardState): boolean =>
      state.claimers ? state.claimers.length > 0 : false,
    isGroup: (state: RewardState): boolean => !!state.groupId,
    isPersonal: (state: RewardState) :boolean => (state.groupId ? false : true),
    hasRewards: (state: RewardState): boolean => (state.rewards ? state.rewards.length > 0 : false),
    isGroupAdmin: (state: RewardState): boolean => (state.activeUser ? state.activeUser.role === 'Admin' : false)
  },
  actions: {
    async manageGroupRewards(groupId: number) {
      try {
        const data = await trpc.groups.getGroupData.query({ groupId })

        if (!data) throw new Error('Failed to initialize group rewards')
        this.groupId = data.id
        this.rewards = data.rewards ?? null
        this.claimers = data.members
        this.activeUser = await trpc.groups.getMembershipInfo.query({ groupId })
      } catch (error) {
        throw new Error('Failed to initialize group rewards')
      }
    },
    async managePersonalRewards() {
      try {
        this.groupId = null
        this.claimers = null
        const rewards: PublicReward[] = await trpc.rewards.getRewards.query({})
        this.rewards = rewards

        return rewards
      } catch (error) {
        throw new Error('Failed to initialize user rewards')
      }
    },

    async updateReward(reward: RewardUpdateable) {
      try {
        const updatedReward = await trpc.rewards.update.mutate(reward)

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
        const reward = await trpc.rewards.create.mutate(newReward)
        this.rewards?.push(reward)
      } catch (error) {
        console.error('Failed to create new reward:', error)
      }
    },
    async claimReward(reward: PublicReward) {
      // claim reward
      try {
        // do claim
      } catch (error) {
        console.error('Failed to create new reward:', error)
      }
    },
  },
})

export type RewardStore = ReturnType<typeof useRewardStore>
