<script setup lang="ts">
import type { InsertableReward, PublicReward, RewardUpdateable} from '@server/shared/types'
import { ref, computed } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import { useRewardStore } from '@/stores/rewardStore'
import NewRewardModule from './NewRewardModule.vue'
import RewardItem from './RewardItem.vue'


const rewardStore = useRewardStore()
const isNewReward = ref(false)
const rewardToUpdate = ref()
const rewards = computed(() => rewardStore.rewards)

const getRewardClaimers = (reward: PublicReward) => {

  return rewardStore.claimers?.filter((user) => 
  reward.targetUserIds?.includes(user.id)
) || [];
}

const isShowRewards = computed(() => {
  const isRewards = rewardStore.hasRewards
  const isAdmin = rewardStore.activeUser?.role ? rewardStore.activeUser?.role === 'Admin' : false

  return isAdmin || isRewards
})

const toggleAddReward = () => {
  isNewReward.value = !isNewReward.value
  rewardToUpdate.value = ''
}

const handleNewReward = async (reward: InsertableReward) => {
  console.log('handling reward', reward)
  await rewardStore.createReward(reward)
}

const currentUser = computed(() => {
  return rewardStore.activeUser
})

const handleRewardUpdate = async (reward: RewardUpdateable) => {
  console.log('updated reward: ', reward)
  await rewardStore.updateReward(reward)
}

const handleRewardChange = async ({ reward, action }: { reward: PublicReward; action: 'delete' | 'edit' | 'claim' }) => {
  switch (action) {
    case 'delete':
    await rewardStore.deleteReward(reward.id)
      break;
    case 'edit':
      rewardToUpdate.value = reward
      isNewReward.value = true
      break;
    case 'claim':
      // Handle claim
      break;
    default:
      isNewReward.value = false
      rewardToUpdate.value = ''
  }
};
</script>
<template>
  <div v-if="isShowRewards" class="flex flex-col flex-nowrap">
    <FwbDropdown>
      <template #trigger>
      <span class=" self-center p-3 bg-slate-300 rounded cursor-pointer hover:bg-blue-100">
        Rewards
      </span>
    </template>
      <fwb-list-group class="w-fit">
        <FwbListGroupItem v-for="reward in rewards" :key="reward.id" hover>
          <RewardItem v-if="currentUser" :reward="reward" :member="currentUser" :claimers="getRewardClaimers(reward)" @reward:change="handleRewardChange" />
        </FwbListGroupItem>
        <FwbListGroupItem>
          <button
            class="w-full px-4 py-2 whitespace-nowrap font-medium text-green-600 hover:bg-green-50"
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
