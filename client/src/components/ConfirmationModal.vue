<script setup lang="ts">
import { ref } from 'vue'
import { FwbModal, FwbButton } from 'flowbite-vue'

const { isShowModal, object, action } = defineProps<{
  isShowModal: boolean
  action: string
  object: any
}>()

const emit = defineEmits<{
  (event: 'delete', value: boolean): void;
}>();


function confirmAction(confirmed: boolean) {
  emit('delete', confirmed);  // Emit the confirmation result (true/false)
}

</script>

<template>
  <FwbModal v-if="isShowModal" persistent >
      <template #header>
      <div class="flex items-center text-lg">Please Confirm the Action</div>
    </template>
    <template #body>
    <p>Do you really want to <span class=" text-red-600">{{ action }}</span> {{ object }}</p>
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
