<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GroupMember, PublicReward } from '@server/shared/types'
import { FwbBadge, FwbButton } from 'flowbite-vue'
import UserBasicProfile from '../user/UserBasicProfile.vue'
import ConfirmationModal from '../ConfirmationModal.vue'

const { reward, userInfo, claimers } = defineProps<{
  reward: PublicReward
  userInfo: GroupMember
  claimers?: GroupMember[]
}>()

const emit = defineEmits<{
  (
    event: 'reward:change',
    value: { reward: PublicReward; action: 'delete' | 'edit' | 'claim' }
  ): void
}>()

const isDeletion = ref(false)
const isClaim = ref(false)
const isAdmin = computed(() => userInfo.role === 'Admin')

const isEnoughRewardAmount = computed(() => {
  return reward.amount === null || reward.amount > 0
})

const isShowAmount = computed(() => {
  return reward.amount !== null
})

const isEnoughPoints = computed(() => {
  const userPoints = userInfo.points ? Number(userInfo.points) : 0

  return reward.cost <= userPoints
})

const pointsBadgeColor = computed(() => (isEnoughPoints.value ? 'green' : 'red'))

const handleRewardEvents = (action: 'delete' | 'edit' | 'claim') => {
  emit('reward:change', { reward, action })
}

const confirmDeletion = () => {
  isDeletion.value = true
}

const confirmClaim = () => {
  isClaim.value = true
}

const handleDeleteConfirmation = (event: boolean) => {
  if (event) {
    handleRewardEvents('delete')
  }
  isDeletion.value = false
}

const handleClaimConfirmation = (event: boolean) => {
  if (event) {
    handleRewardEvents('claim')
  }
  isClaim.value = false
}
</script>
<template>
  <div class="flex w-full flex-col">
    <div class="flex w-full flex-nowrap items-center whitespace-nowrap">
      <div class="mr-3 w-fit" :aria-label="reward.title" data-test="reward-title">
        {{ reward.title }}
      </div>
      <div v-if="isShowAmount" aria-label="reward-amount">
        <FwbBadge type="yellow" data-test="reward-amount-badge">
          {{ reward.amount }}
        </FwbBadge>
      </div>
      <div class="flex w-full items-center justify-end" aria-label="reward-cost">
        <FwbBadge size="sm" :type="pointsBadgeColor" data-test="reward-cost-badge">
          <template #icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#FFD700"
              viewBox="0 0 28 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </template>
          {{ reward.cost }}
        </FwbBadge>
      </div>
    </div>
    <div v-if="claimers" class="flex">
      <UserBasicProfile
        v-for="claimer in claimers"
        :key="claimer.id"
        :user="claimer"
        :aria-label="claimer.username"
        data-test="claimer"
      />
    </div>

    <div class="mt-3 flex items-baseline justify-between space-x-1">
      <div class="flex space-x-1">
        <div v-if="isAdmin">
          <FwbButton
            color="red"
            size="xs"
            @click="confirmDeletion"
            aria-label="Delete Reward"
            data-test="delete-reward-button"
            >delete</FwbButton
          >
        </div>
        <div v-if="isAdmin">
          <FwbButton
            color="yellow"
            size="xs"
            @click="handleRewardEvents('edit')"
            aria-label="Edit Reward"
            data-test="edit-reward-button"
            >Edit</FwbButton
          >
        </div>
      </div>
      <div v-if="isEnoughPoints && isEnoughRewardAmount">
        <FwbButton
          color="green"
          size="sm"
          @click="confirmClaim"
          aria-label="Claim Reward"
          data-test="claim-reward-button"
          >Claim</FwbButton
        >
      </div>
    </div>
  </div>
  <ConfirmationModal
    :is-show-modal="isDeletion"
    :action="'delete'"
    :object="reward.title"
    @confirmed="handleDeleteConfirmation"
  />
  <ConfirmationModal
    :is-show-modal="isClaim"
    :action="'claim'"
    :object="reward.title"
    @confirmed="handleClaimConfirmation"
  />
</template>
