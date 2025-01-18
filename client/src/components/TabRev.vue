<script setup lang="ts">
import {computed} from 'vue'

const { title, isActive, customTailwindClasses } = defineProps<{
  title: string,
  isActive?: string,
  customTailwindClasses?: string
}>();

const activeTab = computed(()=> isActive === title)

const emit = defineEmits<{
  (event: 'tab-click', value: string): void
}>()
</script>

<template>
    <div class="w-full">
        <div
          :class="[
            'flex',
            'w-full',
            'whitespace-nowrap',
            'h-fit',
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
            { ' text-blue-700 bg-blue-100 text-md': activeTab, 'text-zinc-70 text-sm': !activeTab  },
            customTailwindClasses
          ]"
          @click="emit('tab-click', title)"
        >
         <span>{{ title }}</span> 
         <span class="text-sm ml-2">
          <slot></slot>
         </span>
      </div>
    </div>
</template>

