<script setup lang="ts">
import { trpc } from '@/trpc'
import type { CategoriesPublic} from '@server/shared/types'
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

const title = ref<string>('')

async function confirmAction(confirmed: boolean) {
  if (!confirmed) {
    emit('close')
  }

  try {
    const category = await trpc.categories.createCategory.mutate({
      title: title.value,
      groupId: groupId || null,
    })
    emit('create:category', category)
    title.value = ''
  } catch (error) {
    console.log('error while creating category', error)
  }
  emit('close')
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <FwbModal v-if="isShowModal" @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg">Create New Category</div>
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
          />
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
