<script setup lang="ts">
import { ref } from 'vue'
import { FwbButton, FwbModal, FwbInput } from 'flowbite-vue'

const { isShowModal } = defineProps<{
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (event: 'invite:user', value: string): void
  (event: 'close'): void
}>()

const email = ref('')

function confirmAction(confirmed: boolean) {
  if (confirmed) {
    emit('invite:user', email.value)
    email.value = ''
  }
  emit('close')
}

const closeModal = () => {
  emit('close')
}
</script>
<template>
  <FwbModal v-if="isShowModal" @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg">Invite New User to the Group</div>
    </template>
    <template #body>
      <div>
        <FwbInput label="User Email" placeholder="enter user email" v-model="email" required />
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
