<script setup lang="ts">
import { FwbModal, FwbButton } from 'flowbite-vue'

const { isShowModal, object, action } = defineProps<{
  isShowModal: boolean
  action: string
  object: any
}>()

const emit = defineEmits<{
  (event: 'confirmed', value: boolean): void
}>()

function confirmAction(confirmed: boolean) {
  emit('confirmed', confirmed)
}
</script>

<template>
  <FwbModal
    v-if="isShowModal"
    persistent
    role="dialog"
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
    data-test="confirmation-modal"
    @keydown.esc="confirmAction(false)"
  >
    <template #header>
      <div id="modal-title" class="flex items-center text-lg text-black">
        Please Confirm the Action
      </div>
    </template>
    <template #body>
      <p id="modal-description">
        Do you really want to <span class="text-red-600">{{ action }}</span>
        <span class="pl-1 text-base font-extrabold">{{ object }}</span> ?
      </p>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <FwbButton @click="confirmAction(false)" color="alternative" data-test="decline-button">
          Decline
        </FwbButton>
        <FwbButton @click="confirmAction(true)" color="green" data-test="accept-button">
          I accept
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>
