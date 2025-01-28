<script setup lang="ts">
import { type PropType } from 'vue'
import { FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import type { CategoriesPublic } from '@server/shared/types'

const { categories } = defineProps<{
  categories: CategoriesPublic[]
}>()

const selectedCategory = defineModel('selectedCategory', {
  type: [Number, null] as PropType<Number | null>,
})
const selectCategory = (category: CategoriesPublic) => {
  if (selectedCategory.value === category.id) {
    selectedCategory.value = null
    return
  }
  selectedCategory.value = category.id
}

const isSelected = (id: number) => {
  return selectedCategory.value === id ? true : false
}
</script>
<template>
  <div v-if="categories">
    <FwbListGroup v-for="category in categories" :key="category.id">
      <FwbListGroupItem
        :class="[
          'tracking-wider, w-fit whitespace-nowrap',
          { 'bg-blue-400': isSelected(category.id), 'font-bold': category.isDefault },
        ]"
        hover
      >
        <template v-if="isSelected(category.id)"  #prefix>
          <svg
            class="h-5 w-5 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 12H5m14 0-4 4m4-4-4-4"
            />
          </svg>
        </template>
        <button class="w-full pr-3 text-left" @click="selectCategory(category)">
          {{ category.title }}
        </button>
      </FwbListGroupItem>
    </FwbListGroup>
  </div>
</template>
