<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRewardStore } from '@/stores/rewardStore'
import { FwbButton, FwbModal, FwbInput, FwbRange, FwbToggle } from 'flowbite-vue'
import type { PublicReward, RewardUpdateable, InsertableReward } from '@server/shared/types'
import MembersSelection from '../groups/MembersSelection.vue'

const { isShowModal, rewardUpdate } = defineProps<{
  isShowModal: boolean
  rewardUpdate?: PublicReward
}>()

const emit = defineEmits<{
  (event: 'reward:new', value: InsertableReward): void
  (event: 'reward:update', value: RewardUpdateable): void
  (event: 'close'): void
}>()

const headerText = computed(() => (rewardUpdate ? 'Update Reward' : 'Create New Reward'))
const buttonText = computed(() => (rewardUpdate ? 'Update' : 'Add'))

const rewardStore = useRewardStore()
const isClaims = ref(false)
const isForAll = ref(true)
const isForGroup = computed(() => rewardStore.isGroup)
const claimValue = ref(1)
const claimValueLabel = computed(() => `Reward claims: ${claimValue.value}`)
const members = computed(() => rewardStore.claimers || undefined)
const selectedMembers = ref<number[]>([])

const amount = computed(() => (isClaims.value ? Number(claimValue.value) : undefined))

const isCostValid = ref(true)
const isTitleValid = ref(true)

const reward = ref({
  title: '',
  cost: '',
})

function confirmAction(confirmed: boolean) {
  if (!confirmed) {
    emit('close')
  }
  if (!costValidation(reward.value.cost) || !titleValidation(reward.value.title)) {
    isCostValid.value = costValidation(reward.value.cost)
    isTitleValid.value = titleValidation(reward.value.title)
    return
  }
  const targetIds = selectedMembers.value.length ? selectedMembers.value : undefined

  if (rewardUpdate) {
    emit('reward:update', {
      ...rewardUpdate,
      groupId: rewardUpdate.groupId || undefined,
      title: reward.value.title,
      cost: Number(reward.value.cost),
      amount: amount.value || undefined,
      targetUserIds: targetIds,
    })
  } else {
    emit('reward:new', {
      title: reward.value.title,
      cost: Number(reward.value.cost),
      amount: amount.value,
      targetUserIds: targetIds,
      groupId: rewardStore.groupId || undefined,
    })
  }
  emit('close')
  resetReactiveValues()
}

const resetReactiveValues = () => {
  isClaims.value = false
  selectedMembers.value = []
  claimValue.value = 1
  isCostValid.value = true
  reward.value = {
    title: '',
    cost: '',
  }
}

const closeModal = () => {
  resetReactiveValues()
  emit('close')
}

const costValidation = (value: any) => {
  const numberValue = Number(value)

  return !isNaN(numberValue) && numberValue > 0 && Number.isInteger(numberValue)
}

const titleValidation = (value: any) => {
  if (typeof value !== 'string') return false
  const title = value.trim()

  return title.length >= 3 && title.length <= 40
}

function getSelectedMembersForUpdate(): number[] {
  const selectedMembers = rewardStore.claimers?.filter((user) =>
    rewardUpdate?.targetUserIds?.includes(user.id)
  )

  return selectedMembers?.map((member) => member.id) ?? []
}

watch(
  () => rewardUpdate,
  (newRewardUpdate) => {
    if (newRewardUpdate) {
      selectedMembers.value = getSelectedMembersForUpdate()
      reward.value.title = newRewardUpdate.title
      reward.value.cost = String(newRewardUpdate.cost)
      isClaims.value = newRewardUpdate.amount ? true : false
      claimValue.value = newRewardUpdate.amount || 1
      isForAll.value = newRewardUpdate.targetUserIds ? false : true
    }
  },
  { immediate: true }
)
</script>

<template>
  <FwbModal v-if="isShowModal" @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg">{{ headerText }}</div>
    </template>
    <template #body>
      <form @submit.prevent>
        <div class="mb-3">
          <FwbInput
            label="Reward Title"
            minlength="3"
            maxlength="40"
            placeholder="enter reward title"
            v-model="reward.title"
          >
            <template #validationMessage v-if="!isTitleValid">
              <span class="text-red-600">Please enter a valid reward title</span>
            </template>
          </FwbInput>
        </div>
        <div class="flex flex-col">
          <div class="mb-3">
            <FwbToggle label="Limit Reward Claims" v-model="isClaims" />
          </div>
          <div v-if="isClaims" class="mb-3 flex-grow">
            <FwbRange v-model="claimValue" :label="claimValueLabel" :min="1" />
          </div>
        </div>
        <div v-if="isForGroup">
          <div class="mb-3">
            <FwbToggle label="All Members Can Claim" v-model="isForAll" />
          </div>
          <div v-if="!isForAll && members" class="mb-3">
            <MembersSelection :selectedMembers="selectedMembers" :groupMembers="members" />
          </div>
        </div>
        <div>
          <FwbInput
            v-model="reward.cost"
            type="number"
            min="1"
            placeholder="enter reward cost in points"
            label="Reward Cost"
          >
            <template #validationMessage v-if="!isCostValid">
              <span class="text-red-600">Please enter a valid cost for the reward</span>
            </template>
          </FwbInput>
        </div>
      </form>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="confirmAction(false)" color="alternative"> Decline </fwb-button>
        <fwb-button @click="confirmAction(true)" color="green">
          {{ buttonText }} Reward
        </fwb-button>
      </div>
    </template>
  </FwbModal>
</template>

<style scoped></style>
