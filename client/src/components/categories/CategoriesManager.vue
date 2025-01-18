<script setup lang="ts">
import { ref } from 'vue'
import { FwbListGroup, FwbListGroupItem, FwbModal, FwbButton } from 'flowbite-vue'
import { useUserStore } from '@/stores'
import type { CategoriesPublic } from '@server/shared/types'
import DeleteIcon from '../svg/DeleteIcon.vue'
import ConfirmationModal from '../ConfirmationModal.vue'
import { trpc } from '@/trpc'

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
const categoryToDelete = ref()
const userStore = useUserStore()

const confirmCategoryDeletion = (categoryId: number) => {
  categoryToDelete.value = categoryId
  isDeletionRequired.value = true
}

const deleteCategory = async (confirmed: boolean) => {
  const categoryId = categoryToDelete.value
  if (confirmed && categoryId) {
    await trpc.categories.deleteCategory.mutate({ categoryId })
    userStore.fetchUserData()
  }

  isDeletionRequired.value = false
  categoryToDelete.value = undefined
}
</script>
<template>
  <div v-if="categories">
    <FwbModal v-if="isShowCategories" @close="closeModal">
      <template #header>
        <span>Categories</span>
      </template>
      <template #body>
        <FwbListGroup v-for="category in categories" :key="category.id" class="w-full">
          <FwbListGroupItem class="flex w-full justify-between whitespace-nowrap tracking-wider" hover>
            <span>{{ category.title }}</span>
            <FwbButton
              class="w-fit p-1 text-left"
              @click="confirmCategoryDeletion(category.id)"
              color="red"
              ><DeleteIcon :color="'white'"
            /></FwbButton>
            <ConfirmationModal
              :action="'delete'"
              :object="category.title"
              :is-show-modal="isDeletionRequired"
              @confirmed="deleteCategory"
            />
          </FwbListGroupItem>
        </FwbListGroup>
      </template>
    </FwbModal>
  </div>
</template>
