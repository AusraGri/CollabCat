<script setup lang="ts">
import { FwbModal, FwbButton, FwbInput } from 'flowbite-vue'
import { ref } from 'vue'

const { isShowModal } = defineProps<{
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (event: 'create:group', value: string): void
  (event: 'close'): void
}>()

const name = ref<string>('')

function confirmAction(confirmed: boolean) {
  if (confirmed) {
    emit('create:group', name.value)
    name.value = ''
  }
  emit('close')
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <FwbModal v-if="isShowModal" @close="closeModal" data-test="create-group-modal">
    <template #header>
      <h2 class="text-lg font-semibold" data-test="modal-header">Create New Group</h2>
    </template>
    <template #body>
      <div>
        <form>
          <FwbInput
            label="Group Name"
            placeholder="enter group name"
            v-model="name"
            data-test="group-name-input"
            aria-label="Enter group name"
          />
        </form>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <FwbButton
          @click="confirmAction(false)"
          color="alternative"
          data-test="decline-button"
          aria-label="Decline group creation"
        >
          Decline
        </FwbButton>
        <FwbButton
          @click="confirmAction(true)"
          color="green"
          type="submit"
          :disabled="name.length < 3"
          data-test="accept-button"
          aria-label="Confirm group creation"
        >
          I accept
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>
