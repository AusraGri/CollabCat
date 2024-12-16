<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GroupMember, GroupReward } from '@server/shared/types'
import { FwbBadge, FwbButton } from 'flowbite-vue'

const { reward, member } = defineProps<{
  reward: GroupReward
  member: GroupMember
}>()

const emit = defineEmits<{
  (event: 'reward:edit', value: GroupReward): void
  (event: 'reward:delete', value: GroupReward ): void
  (event: 'reward:claim', value: GroupReward ): void
}>()

const isAdmin = computed(() => member.role === 'Admin')

const isEnoughPoints = computed(() => {
  const userPoints = member.points ? Number(member.points) : 0

  return reward.cost < userPoints
})

const pointsBadgeColor = computed(() => (isEnoughPoints.value ? 'green' : 'red'))
</script>
<template>
  <div class="flex w-full flex-col">
    <div class="flex w-full flex-nowrap items-center whitespace-nowrap">
      <div class="mr-3 w-fit">
        {{ reward.title }}
      </div>
      <div class="flex w-full items-center justify-end" aria-label="reward-cost">
        <fwb-badge size="sm" :type="pointsBadgeColor">
          <template #icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#FFD700"
              viewBox="0 0 28 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </template>
          {{ reward.cost }}
        </fwb-badge>
      </div>
      <div v-if="!!reward.amount" aria-label="reward-amount">
        <FwbBadge type="yellow">
          {{ reward.amount }}
        </FwbBadge>
      </div>
    </div>

    <div class="mt-3 flex justify-end">
      <div v-if="isEnoughPoints" class="mr-3 bg-slate-400">claim</div>
      <div v-if="isAdmin" class="mr-3">
        <FwbButton color="yellow" size="xs" @click="editReward">Edit</FwbButton>
      </div>
      <div v-if="isAdmin">
        <FwbButton color="red" size="xs">delete</FwbButton>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
