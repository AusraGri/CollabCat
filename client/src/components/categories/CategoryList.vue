<script setup lang="ts">
import { type PropType } from 'vue'
import { ChevronDoubleRightIcon } from '@heroicons/vue/24/outline'
import { FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import type { CategoriesPublic } from '@server/shared/types'

const { categories } = defineProps<{
  categories: CategoriesPublic[]
}>()

const selectedCategory = defineModel('selectedCategory', {
  type: [Object, null] as PropType<CategoriesPublic | null>,
})

const selectCategory = (category: CategoriesPublic) => {
  if (selectedCategory.value === category) {
    selectedCategory.value = null
    return
  }
  selectedCategory.value = category
}

const isSelected = (id: number) => {
  return selectedCategory.value?.id === id ? true : false
}
</script>
<template>
  <div v-if="categories">
    <FwbListGroup v-for="category in categories" :key="category.id" data-test="category-list">
      <FwbListGroupItem
        :class="[
          'tracking-wider, w-fit whitespace-nowrap',
          { 'bg-blue-400': isSelected(category.id) },
        ]"
        hover
        data-test="category-item"
      >
        <template v-if="isSelected(category.id)" #prefix>
          <div data-test="selected-icon" aria-hidden="true">
            <ChevronDoubleRightIcon class="h-5 w-5 text-green-300" />
          </div>
        </template>
        <button
          class="w-full pr-3 text-left"
          @click="selectCategory(category)"
          :aria-label="
            isSelected(category.id)
              ? `Deselect category: ${category.title}`
              : `Select category: ${category.title}`
          "
          data-test="select-category-button"
        >
          {{ category.title }}
        </button>
      </FwbListGroupItem>
    </FwbListGroup>
  </div>
</template>
