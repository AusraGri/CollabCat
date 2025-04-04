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
  const max = 1000000

  return (
    !isNaN(numberValue) && numberValue > 0 && Number.isInteger(numberValue) && numberValue <= max
  )
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
  <FwbModal v-if="isShowModal" @close="closeModal" aria-labelledby="reward-modal-header">
    <template #header>
      <h2 id="reward-modal-header" class="text-lg font-semibold" data-test="reward-modal-header">
        {{ headerText }}
      </h2>
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
            aria-label="Reward Title"
            data-test="reward-title-input"
          >
            <template #validationMessage v-if="!isTitleValid">
              <span class="text-red-600" aria-live="assertive"
                >Please enter a valid reward title: length 3 - 40 letters</span
              >
            </template>
          </FwbInput>
        </div>
        <div class="flex flex-col">
          <div class="mb-3">
            <FwbToggle
              label="Limit Reward Claims"
              v-model="isClaims"
              aria-label="Limit Reward Claims"
              data-test="reward-claim-limit"
            />
          </div>
          <div v-if="isClaims" class="mb-3 flex-grow">
            <FwbRange
              v-model="claimValue"
              :label="claimValueLabel"
              :min="1"
              aria-label="Claim Value"
              data-test="claim-value-range"
            />
          </div>
        </div>
        <div v-if="isForGroup">
          <div class="mb-3">
            <FwbToggle
              label="All Members Can Claim"
              v-model="isForAll"
              aria-label="All Members Can Claim"
            />
          </div>
          <div v-if="!isForAll && members" class="mb-3">
            <MembersSelection
              :selectedMembers="selectedMembers"
              :groupMembers="members"
              aria-label="Select Members"
            />
          </div>
        </div>
        <div>
          <FwbInput
            v-model="reward.cost"
            type="number"
            min="1"
            placeholder="enter reward cost in points"
            label="Reward Cost"
            aria-label="Reward Cost"
            data-test="reward-cost-input"
          >
            <template #validationMessage v-if="!isCostValid">
              <span
                class="text-red-600"
                aria-live="assertive"
                aria-label="Reward cost error message"
                >Please enter a valid cost for the reward: 1 - 1000000</span
              >
            </template>
          </FwbInput>
        </div>
      </form>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <FwbButton
          @click="confirmAction(false)"
          color="alternative"
          aria-label="Decline reward creation"
          data-test="decline-button"
        >
          Decline
        </FwbButton>
        <FwbButton
          @click="confirmAction(true)"
          color="green"
          type="submit"
          aria-label="Submit reward creation"
          data-test="submit-reward-button"
          :disabled="reward.title.length < 3"
        >
          {{ buttonText }} Reward
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>
