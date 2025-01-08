<script setup lang="ts">
import { computed } from 'vue'
const { color } = defineProps<{
  color?: string
}>()

const iconColor = computed(() => {
  if (!color) return 'currentColor'

  return color
})
</script>

<template>
  <svg
    class="h-6 w-6 text-gray-800 dark:text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      :stroke="iconColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
</template>
