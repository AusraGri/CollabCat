<script setup lang="ts">
import { FwbModal, FwbButton } from 'flowbite-vue'

const { isShowModal, object, action } = defineProps<{
  isShowModal: boolean
  action: string
  object: any
}>()

const emit = defineEmits<{
  (event: 'confirmed', value: boolean): void;
}>();


function confirmAction(confirmed: boolean) {
  emit('confirmed', confirmed);  // Emit the confirmation result (true/false)
}

</script>

<template>
  <FwbModal v-if="isShowModal" persistent >
      <template #header>
      <div class="flex items-center text-lg text-black">Please Confirm the Action</div>
    </template>
    <template #body>
    <p>Do you really want to <span class=" text-red-600">{{ action }}</span> <span class=" font-extrabold text-base">{{ object }}</span> ?</p>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="confirmAction(false)" color="alternative"> Decline </fwb-button>
        <fwb-button @click="confirmAction(true)" color="green"> I accept </fwb-button>
      </div>
    </template>
  </FwbModal>
</template>
<style scoped></style>
