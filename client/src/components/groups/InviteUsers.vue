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
      <h2 class="text-lg font-semibold" data-test="modal-header">Invite New User to the Group</h2>
    </template>
    <template #body>
      <div>
        <FwbInput
          label="User Email"
          placeholder="enter user email"
          v-model="email"
          required
          aria-label="Enter the email address of the user"
          data-test="user-email-input"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <FwbButton
          @click="confirmAction(false)"
          color="alternative"
          aria-label="Decline invitation"
          data-test="decline-button"
        >
          Decline
        </FwbButton>
        <FwbButton
          @click="confirmAction(true)"
          color="green"
          aria-label="Send invitation"
          data-test="send-invitation-button"
        >
          Send Invitation
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>
