<script setup lang="ts">
import { ref } from 'vue'
import { FwbButton, FwbModal, FwbInput, FwbRange, FwbToggle } from 'flowbite-vue'

const { isShowModal } = defineProps<{
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (event: 'reward:new', value: any): void
  (event: 'close'): void
}>()


const isClaims = ref(false)
const claimValue = ref(1)

const reward = ref({
  title: '',
  count: isClaims.value ? claimValue.value : undefined,
})

function confirmAction(confirmed: boolean) {
  if (confirmed) {
    emit('reward:new', reward.value)
  }
  emit('close')
}

const closeModal = () => {
  isClaims.value = false
  claimValue.value = 1 
 

  emit('close')
}
</script>
<template>
  <FwbModal v-if="isShowModal" @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg">Create New Reward</div>
    </template>
    <template #body>
      <div>
        <FwbInput
          label="Reward Title"
          placeholder="enter reward title"
          v-model="reward.title"
          required
        />
      </div>
      <div>
        <FwbToggle label="Limit Reward Claims" v-model="isClaims"/>
      </div>
      <div v-if="isClaims">
        <FwbRange v-model="claimValue" label="Count of Reward claims" :min="1" />
        <pre>Current value: {{ reward.count }}</pre>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="confirmAction(false)" color="alternative"> Decline </fwb-button>
        <fwb-button @click="confirmAction(true)" color="green"> Send Invitation </fwb-button>
      </div>
    </template>
  </FwbModal>
</template>

<style scoped></style>
