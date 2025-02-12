<script setup lang="ts">
import type { InsertableReward, PublicReward, RewardUpdateable } from '@server/shared/types'
import { ref, computed } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import { useRewardStore } from '@/stores'
import NewRewardModule from './NewRewardModule.vue'
import RewardItem from './RewardItem.vue'

const emit = defineEmits<{
  (event: 'reward:claimed', value: { cost: number }): void
  (event: 'closed'): void
}>()

const rewardStore = useRewardStore()
const isNewReward = ref(false)
const rewardToUpdate = ref()
const rewards = computed(() => rewardStore.rewards || [])
const getRewardClaimers = (reward: PublicReward) => {
  return rewardStore.claimers?.filter((user) => reward.targetUserIds?.includes(user.id)) || []
}

const isShowRewards = computed(() => {
  const isRewards = rewardStore.isRewardsEnabled
  return isRewards
})

const currentUser = computed(() => {
  return rewardStore.activeUser
})

const toggleAddReward = () => {
  isNewReward.value = !isNewReward.value
  rewardToUpdate.value = ''
}

const handleNewReward = async (reward: InsertableReward) => {
  await rewardStore.createReward(reward)
}

const handleRewardUpdate = async (reward: RewardUpdateable) => {
  await rewardStore.updateReward(reward)
}

const handleRewardChange = async ({
  reward,
  action,
}: {
  reward: PublicReward
  action: 'delete' | 'edit' | 'claim'
}) => {
  switch (action) {
    case 'delete':
      await rewardStore.deleteReward(reward.id)
      break
    case 'edit':
      rewardToUpdate.value = reward
      isNewReward.value = true
      break
    case 'claim':
      await rewardStore.claimReward(reward)
      emit('reward:claimed', { cost: reward.cost })
      break
    default:
      isNewReward.value = false
      rewardToUpdate.value = ''
  }
}
</script>
<template>
  <div v-if="isShowRewards" class="flex flex-col flex-nowrap">
    <FwbDropdown align-to-end @hide="emit('closed')">
      <template #trigger>
        <slot name="trigger"></slot>
      </template>
      <fwb-list-group class="w-fit">
        <FwbListGroupItem v-for="reward in rewards" :key="reward.id" hover>
          <RewardItem
            v-if="currentUser"
            :reward="reward"
            :user-info="currentUser"
            :claimers="getRewardClaimers(reward)"
            @reward:change="handleRewardChange"
          />
        </FwbListGroupItem>
        <FwbListGroupItem v-if="rewardStore.isGroupAdmin || rewardStore.isPersonal">
          <button
            class="w-full whitespace-nowrap px-4 py-2 font-medium text-green-600 hover:bg-green-50"
            @click="toggleAddReward"
          >
            + Add Reward
          </button>
        </FwbListGroupItem>
      </fwb-list-group>
    </FwbDropdown>
    <div>
      <NewRewardModule
        :is-show-modal="isNewReward"
        :reward-update="rewardToUpdate"
        @reward:new="handleNewReward"
        @reward:update="handleRewardUpdate"
        @close="toggleAddReward"
      />
    </div>
  </div>
</template>

<style scoped></style>
