<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import {
  FwbButton,
  FwbModal,
  FwbInput,
  FwbRange,
  FwbToggle,
  FwbDropdown,
  FwbAvatar,
  FwbListGroup,
  FwbListGroupItem,
} from 'flowbite-vue'
import type { GroupMember } from '@server/shared/types'

const { isShowModal } = defineProps<{
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (event: 'reward:new', value: any): void
  (event: 'close'): void
}>()

const userGroupStore = useUserGroupsStore()
const isClaims = ref(false)
const isForAll = ref(true)
const claimValue = ref(1)
const claimValueLabel = computed(()=> `Reward claims: ${claimValue.value}`)
const members = computed(() => userGroupStore.groupMembers)
const selectedMembers = ref<GroupMember[]>([])
const cost = ref()

const amount = computed(() => isClaims.value ? Number(claimValue.value) : undefined)

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
  emit('reward:new', { ...reward.value, amount: amount.value })
  emit('close')
  resetReactiveValues()

}

const resetReactiveValues = () => {
  isClaims.value = false
  claimValue.value = 1
  isCostValid.value = true
  cost.value = ''
  reward.value = {
    title: '',
    cost: '',
  }
}

const closeModal = () => {
  console.log(reward.value)
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

const isMemberChecked = (member: GroupMember) => {
  return selectedMembers.value.some((selected) => selected.id === member.id)
}

const updateValue = (event: Event, member: GroupMember) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedMembers.value.push(member)
  } else {
    selectedMembers.value = selectedMembers.value.filter((selected) => selected.id !== member.id)
  }
}
</script>

<template>
  <FwbModal v-if="isShowModal" @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg">Create New Reward</div>
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
          <div v-if="isClaims" class="flex-grow mb-3">
            <FwbRange v-model="claimValue" :label="claimValueLabel" :min="1" />
          </div>
        </div>
        <div>
          <div class="mb-3">
            <FwbToggle label="All Members Can Claim" v-model="isForAll" />
          </div>
          <div v-if="!isForAll" class="mb-3">
            <FwbDropdown placement="bottom" text="Choose members">
              <FwbListGroup>
                <FwbListGroupItem v-for="member in members" :key="member.id" hover>
                  <label class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      :value="member"
                      :checked="isMemberChecked(member)"
                      @change.prevent="(event) => updateValue(event, member)"
                      class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <FwbAvatar :img="member.picture || undefined" rounded size="sm" />
                    </span>
                    <span class="text-sm text-gray-900">{{ member.username }}</span>
                  </label>
                </FwbListGroupItem>
              </FwbListGroup>
            </FwbDropdown>
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
        <fwb-button @click="confirmAction(true)" color="green"> Add Reward </fwb-button>
      </div>
    </template>
  </FwbModal>
</template>

<style scoped></style>
