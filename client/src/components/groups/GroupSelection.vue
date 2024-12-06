<script setup lang="ts">
import { ref } from 'vue'
import { FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import { type GroupsPublic } from '@server/shared/types'

const { groups } = defineProps<{
  groups: GroupsPublic[]
}>()

const emit = defineEmits<{
  (event: 'selected:group', value: GroupsPublic): void
}>()

const isOpen = ref(false)
const selected = ref('Personal')

const selectItem = (group: GroupsPublic) => {
  selected.value = group.name
  isOpen.value = false
  emit('selected:group', group)
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const createNewGroup = () => {
  isOpen.value = false
}
</script>

<template>
  <div class="relative inline-block min-w-32">
    <button
      @click="toggleDropdown"
      class="flex w-full items-center justify-between rounded-md bg-blue-500 px-4 py-2 text-left text-white"
    >
      <span>{{ selected || 'Select an option' }}</span>
      <svg
        class="ms-3 h-2.5 w-2.5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 10 6"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 4 4 4-4"
        />
      </svg>
    </button>
<!-- Drop down menu items -->
    <div
      v-if="isOpen"
      class="absolute right-0 z-10 mt-2 w-fit rounded-md border border-gray-300 bg-white shadow-lg"
    >
      <fwb-list-group>
        <fwb-list-group-item
          hover
          v-for="group in groups"
          :key="group.id"
          @click="selectItem(group)"
        >
          {{ group }}
        </fwb-list-group-item>
        <FwbListGroupItem v-if="!groups.length">You have no groups 👇</FwbListGroupItem>
      </fwb-list-group>
      <div class="my-1 border-t border-gray-200"></div>
      <button
        class="w-full px-4 py-2 font-medium text-green-600 hover:bg-green-50"
        @click="createNewGroup"
      >
        + Create New Group
      </button>
    </div>
  </div>
</template>
<style scoped></style>
