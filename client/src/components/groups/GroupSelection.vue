<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdByUserId, ...activeGroup } = group
  userGroupStore.activeGroup = activeGroup
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
    >
      <span>{{ selected || 'Groups' }}</span>
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
          {{ group.name }}
        </fwb-list-group-item>
        <FwbListGroupItem v-if="!groups.length">You have no groups 👇</FwbListGroupItem>
        <FwbListGroupItem v-if="selected" hover @click="handleNoGroup"
          >-- No Group --</FwbListGroupItem
        >
      </fwb-list-group>
      <div class="my-1 border-t border-gray-200"></div>
      <button
        class="w-full px-4 py-2 font-medium text-green-600 hover:bg-green-50"
        @click="toggleCreateNewGroup"
      >
        + Create New Group
      </button>
    </div>
  </div>
  <CreateNewGroupModal
    :is-show-modal="isCreateNewGroup"
    @create:group="createNewGroup"
    @close="isCreateNewGroup = false"
  />
</template>
<style scoped></style>
