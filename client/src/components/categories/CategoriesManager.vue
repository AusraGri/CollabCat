<script setup lang="ts">
import { ref } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { FwbListGroup, FwbListGroupItem, FwbModal, FwbButton } from 'flowbite-vue'
import { useCategoriesStore } from '@/stores'
import type { CategoriesPublic } from '@server/shared/types'
import ConfirmationModal from '../ConfirmationModal.vue'

const { categories, isShowCategories } = defineProps<{
  categories: CategoriesPublic[]
  isShowCategories: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const closeModal = () => {
  emit('close')
}

const isDeletionRequired = ref(false)
const categoryToDelete = ref<CategoriesPublic | undefined>()
const categoryStore = useCategoriesStore()

const confirmCategoryDeletion = (category: CategoriesPublic) => {
  categoryToDelete.value = category
  isDeletionRequired.value = true
}

const deleteCategory = async (confirmed: boolean) => {
  const categoryId = categoryToDelete.value?.id
  if (confirmed && categoryId) {
    await categoryStore.deleteCategory(categoryId)
  }

  isDeletionRequired.value = false
  categoryToDelete.value = undefined
}
</script>
<template>
  <div v-if="categories">
    <FwbModal v-if="isShowCategories" @close="closeModal" data-test="categories-modal">
      <template #header>
        <h2 class="text-lg font-semibold" data-test="modal-header">Categories</h2>
      </template>
      <template #body>
        <FwbListGroup v-for="category in categories" :key="category.id" class="w-full">
          <FwbListGroupItem
            class="flex w-full justify-between whitespace-nowrap tracking-wider"
            hover
            data-test="category-item"
          >
            <span data-test="category-title">{{ category.title }}</span>
            <FwbButton
              class="w-fit p-1 text-left"
              @click="confirmCategoryDeletion(category)"
              color="red"
              data-test="delete-category-button"
              :aria-label="`Delete ${category.title}`"
            >
              <TrashIcon class="h-5 w-5 text-slate-50" />
            </FwbButton>
          </FwbListGroupItem>
        </FwbListGroup>
      </template>
    </FwbModal>
    <ConfirmationModal
      :action="'delete'"
      :object="categoryToDelete?.title"
      :is-show-modal="isDeletionRequired"
      @confirmed="deleteCategory"
      data-test="confirmation-modal"
    />
  </div>
</template>
