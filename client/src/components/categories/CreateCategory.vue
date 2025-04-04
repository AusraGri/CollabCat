<script setup lang="ts">
import { useCategoriesStore } from '@/stores'
import type { CategoriesPublic } from '@server/shared/types'
import { FwbModal, FwbButton, FwbInput } from 'flowbite-vue'
import { ref } from 'vue'
import { useKeyboardAction } from '@/composables/useKeyboardAction'

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

const isCategoryTitle = (params: { title: string; groupId?: number }) => {
  const { title, groupId } = params

  const groupCategories = categoryStore.groupCategories
  const groupCategoriesGroupId = groupCategories.length ? groupCategories[0].groupId : undefined
  const userCategories = categoryStore.userCategories

  if (groupId) {
    if (groupCategoriesGroupId && groupCategoriesGroupId === groupId) {
      const isGroupTitle = groupCategories.some(
        (cat) => cat.title.toLowerCase() === title.toLowerCase()
      )
      return isGroupTitle
    }
  }

  const isPersonalTitle = userCategories.some(
    (cat) => cat.title.toLowerCase() === title.toLowerCase()
  )
  return isPersonalTitle
}

async function confirmAction(confirmed: boolean) {
  if (!confirmed) {
    closeModal()

    return
  }

  const isCategory = isCategoryTitle({ title: title.value, groupId: groupId })

  if (isCategory) {
    closeModal()

    return
  }

  const category = await categoryStore.createCategory({
    title: title.value,
    groupId: groupId || null,
  })
  emit('create:category', category)

  closeModal()
}

const closeModal = () => {
  emit('close')
  title.value = ''
}

useKeyboardAction(
  () => confirmAction(true),
  () => confirmAction(false),
  () => title.value.length >= 3
)
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
        <FwbButton @click="confirmAction(false)" color="alternative" data-test="decline-button">
          Decline
        </FwbButton>
        <FwbButton
          @click="confirmAction(true)"
          type="submit"
          color="green"
          :disabled="title.length < 3"
          data-test="accept-button"
        >
          I accept
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>
