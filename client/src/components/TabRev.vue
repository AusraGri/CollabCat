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
  <div class="w-full h-full">
    <div
      :class="[
        'flex',
        'w-full',
        'whitespace-nowrap',
        'h-full',
        'min-h-7',
        'rounded-t-xl',
        'tracking-wider',
        'border-2',
        'border-b-0',
        'border-green-500',
        'pl-3',
        'pr-3',
        'items-center',
        'text-center',
        'hover:bg-slate-200',
        'hover:cursor-pointer',
        'dark:border-gray-700',
        'dark:text-gray-400',
        { ' text-md bg-blue-100 text-blue-700': activeTab, 'text-zinc-70 text-sm': !activeTab },
        customTailwindClasses,
      ]"
      @click="emit('tab-click', title)"
      role="tab"
      :aria-selected="activeTab"
      :aria-label="`${title} tab`"
      tabindex="0"
      :data-test="`${title}-tab`"
      @keydown.enter="emit('tab-click', title)"
      @keydown.space="emit('tab-click', title)"
    >
      <span>{{ title }}</span>
      <span class="ml-2 text-sm">
        <slot></slot>
      </span>
    </div>
  </div>
</template>
