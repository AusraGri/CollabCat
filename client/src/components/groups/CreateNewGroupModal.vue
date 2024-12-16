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
  <FwbModal v-if="isShowModal"  @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg">Create New Group</div>
    </template>
    <template #body>
      <div>
        <form>
          <FwbInput label="Group Name" placeholder="enter group name" v-model="name" />
        </form>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="confirmAction(false)" color="alternative"> Decline </fwb-button>
        <fwb-button @click="confirmAction(true)" color="green"> I accept </fwb-button>
      </div>
    </template>
  </FwbModal>
</template>
