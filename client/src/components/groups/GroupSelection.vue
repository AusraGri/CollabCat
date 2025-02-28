<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import { type GroupsPublic } from '@server/shared/types'
import CreateNewGroupModal from './CreateNewGroupModal.vue'

const userGroupStore = useUserGroupsStore()

const groups = computed(() => {
  return userGroupStore.userGroups || []
})
const isOpen = ref(false)
const isCreateNewGroup = ref(false)
const selected = computed(() => userGroupStore.activeGroup?.name)
const dropdownRef = ref<HTMLElement | null>(null)

const selectItem = async (group: GroupsPublic): Promise<void> => {
  userGroupStore.activeGroup = group
  isOpen.value = false
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const toggleCreateNewGroup = () => {
  isCreateNewGroup.value = !isCreateNewGroup.value
  isOpen.value = false
}

const createNewGroup = async (name: string) => {
  await userGroupStore.createNewGroup(name)
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(async () => {
  await userGroupStore.fetchUserGroups()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleNoGroup = () => {
  userGroupStore.activeGroup = null
  isOpen.value = false
}
</script>
<template>
  <div class="relative inline-block min-w-32" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      class="flex w-full items-center justify-between rounded-md bg-blue-500 px-4 py-2 text-left text-white"
      :aria-expanded="isOpen"
      aria-label="Dropdown for selecting group"
      data-test="dropdown-button"
    >
      <span>{{ selected || 'Groups' }}</span>
      <ChevronDownIcon class="h-5 w-5" />
    </button>
    <div
      v-if="isOpen"
      class="absolute right-0 z-10 mt-2 w-fit rounded-md border border-gray-300 bg-white shadow-lg"
      aria-labelledby="dropdown-button"
      data-test="dropdown-menu"
    >
      <FwbListGroup>
        <FwbListGroupItem
          hover
          v-for="group in groups"
          :key="group.id"
          @click="selectItem(group)"
          data-test="group-item"
          aria-label="Select {{ group.name }} group"
        >
          {{ group.name }}
        </FwbListGroupItem>
        <FwbListGroupItem v-if="!groups.length" data-test="no-groups"
          >You have no groups 👇</FwbListGroupItem
        >
        <FwbListGroupItem v-if="selected" hover @click="handleNoGroup" data-test="no-group-option"
          >-- No Group --</FwbListGroupItem
        >
      </FwbListGroup>
      <div class="my-1 border-t border-gray-200"></div>
      <button
        class="w-full px-4 py-2 font-medium text-green-600 hover:bg-green-50"
        @click="toggleCreateNewGroup"
        data-test="create-new-group-button"
        aria-label="Create a new group"
      >
        + Create New Group
      </button>
    </div>
  </div>
  <CreateNewGroupModal
    :is-show-modal="isCreateNewGroup"
    @create:group="createNewGroup"
    @close="isCreateNewGroup = false"
    data-test="create-new-group-modal"
  />
</template>
