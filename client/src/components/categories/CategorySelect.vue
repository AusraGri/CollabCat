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
  return [...userCategories, { value: '', name: '-- No Category --' }]
})
</script>

<template>
  <div class="flex w-fit items-center gap-x-2">
    <FwbSelect
      id="category-select"
      v-model="selectedCategory"
      :options="categoryOptions"
      placeholder="Select Category"
      :aria-label="label || 'Select a category'"
      data-test="category-selection"
    />
  </div>
</template>
