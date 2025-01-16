<script setup lang="ts">
import { computed } from 'vue'
import { FwbSelect } from 'flowbite-vue'
import type { CategoriesPublic } from '@server/shared/types'

const { categories } = defineProps<{
  categories: CategoriesPublic[]
  label?: string
}>()

const selectedCategory = defineModel('selectedCategory', { type: String })
const categoryOptions = computed(() => {
  const userCategories = categories.map((category) => ({
    value: String(category.id),
    name: category.title,
  }))
  return [ ...userCategories, { value: '', name: '-- No Category --' }]
})
</script>

<template>
  <div class="w-fit">
    <FwbSelect
      v-model="selectedCategory"
      :options="categoryOptions"
      :label="label"
      placeholder="Select Category"
    />
  </div>
</template>
