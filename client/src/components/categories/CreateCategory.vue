<script setup lang="ts">
import { useCategoriesStore } from '@/stores'
import type { CategoriesPublic } from '@server/shared/types'
import { FwbModal, FwbButton, FwbInput } from 'flowbite-vue'
import { ref } from 'vue'

const { isShowModal, groupId } = defineProps<{
  isShowModal: boolean
  groupId?: number
}>()

const emit = defineEmits<{
  (event: 'create:category', value: CategoriesPublic): void
  (event: 'close'): void
}>()

const categoryStore = useCategoriesStore()
const title = ref<string>('')

async function confirmAction(confirmed: boolean) {
  if (!confirmed) {
    closeModal()

    return
  }

  try {
    const category = await categoryStore.createCategory({
      title: title.value,
      groupId: groupId || null,
    })
    emit('create:category', category)
  } catch (error) {
    console.log('error while creating category', error)
  }
  closeModal()
}

const closeModal = () => {
  emit('close')
  title.value = ''
}
</script>

<template>
  <FwbModal v-if="isShowModal" @close="closeModal" data-test="create-category-modal">
    <template #header>
      <div class="flex items-center text-lg" data-test="modal-header">Create New Category</div>
    </template>
    <template #body>
      <div>
        <form>
          <FwbInput
            label="Category Title"
            placeholder="enter category title"
            v-model="title"
            minlength="3"
            maxlength="20"
            required
            data-test="category-title-input"
            aria-label="Enter category title"
          />
        </form>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="confirmAction(false)" color="alternative" data-test="decline-button">
          Decline
        </fwb-button>
        <fwb-button
          @click="confirmAction(true)"
          type="submit"
          color="green"
          :disabled="title.length < 3"
          data-test="accept-button"
        >
          I accept
        </fwb-button>
      </div>
    </template>
  </FwbModal>
</template>
