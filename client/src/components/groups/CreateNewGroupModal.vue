<script setup lang="ts">
import { FwbModal, FwbButton, FwbInput, FwbAlert } from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores'
import { ref } from 'vue'

const { isShowModal } = defineProps<{
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (event: 'create:group', value: string): void
  (event: 'close'): void
}>()

const userGroupStore = useUserGroupsStore()
const errorMessage = ref('')

const name = ref<string>('')

const isGroupName = (name: string) => {
  const userGroups = userGroupStore.userGroups || []
  return userGroups.some((group) => group.name.toLowerCase() === name.toLowerCase())
}

function confirmAction(confirmed: boolean) {
  if (confirmed) {
    const isName = isGroupName(name.value)

    if (isName) {
      errorMessage.value = 'This group name already exist in your groups'
      return
    }
    emit('create:group', name.value)
  }

  closeModal()
}

const closeModal = () => {
  errorMessage.value = ''
  name.value = ''
  emit('close')
}
</script>

<template>
  <FwbModal v-if="isShowModal" @close="closeModal" data-test="create-group-modal">
    <template #header>
      <div class="inline-flex items-center space-x-2">
        <h2 class="text-lg font-semibold" data-test="group-modal-header">Create New Group</h2>
        <FwbAlert icon type="danger" v-if="errorMessage">{{ errorMessage }}</FwbAlert>
      </div>
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
