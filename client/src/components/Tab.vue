<script setup lang="ts">
import { computed } from 'vue'

const { title, isActive, customTailwindClasses } = defineProps<{
  title: string
  isActive?: string
  customTailwindClasses?: string
}>()

const activeTab = computed(() => isActive === title)

const emit = defineEmits<{
  (event: 'tab-click', value: string): void
}>()
</script>

<template>
  <div class="w-full">
    <div
      :class="[
        'w-full',
        'h-7',
        'rounded-b-xl',
        'tracking-wider',
        'border-2',
        'border-t-0',
        'border-blue-500',
        'pl-3',
        'pr-3',
        'items-center',
        'text-center',
        'hover:bg-slate-200',
        'hover:cursor-pointer',
        'shadow-md',
        'dark:border-gray-700',
        'dark:text-gray-400',
        { 'text-md bg-blue-100 text-blue-700': activeTab, 'text-zinc-70 text-sm': !activeTab },
        customTailwindClasses,
      ]"
      @click="emit('tab-click', title)"
    >
      {{ title }}
    </div>
    <slot></slot>
  </div>
</template>
