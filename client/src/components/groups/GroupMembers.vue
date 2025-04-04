<script setup lang="ts">
import { ref, computed } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbAvatar, FwbBadge } from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores'
import InviteUsers from './InviteUsers.vue'

const userGroupStore = useUserGroupsStore()
const isShowInvite = ref(false)
const members = computed(() => userGroupStore.groupMembers)

const groupAdminId = computed(() => {
  return userGroupStore.activeGroup?.createdByUserId || undefined
})

const toggleInviteUser = () => {
  isShowInvite.value = !isShowInvite.value
}

const handleInvitation = async (email: string) => {
  if (!userGroupStore.activeGroup?.id) {
    return
  }
  await userGroupStore.inviteUser(email)
}
</script>
<template>
  <FwbDropdown align-to-end content-class="rounded-xl">
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <FwbListGroup class="w-full">
      <FwbListGroupItem v-for="member in members" :key="member.id" hover>
        <div class="flex min-w-fit items-center space-x-2">
          <FwbAvatar :img="member.picture || undefined" rounded size="md" />
          <div class="ml-2 whitespace-nowrap">{{ member.username }}</div>
          <div v-if="member.id === groupAdminId">
            <FwbBadge type="yellow">Admin</FwbBadge>
          </div>
        </div>
      </FwbListGroupItem>
      <FwbListGroupItem v-if="userGroupStore.isAdmin">
        <button
          class="w-full px-4 py-2 font-medium text-green-600 hover:bg-green-50"
          @click="toggleInviteUser"
          data-test="invite-user-button"
          aria-label="Invite a user to the group"
        >
          + Invite User
        </button>
      </FwbListGroupItem>
    </FwbListGroup>
  </FwbDropdown>
  <InviteUsers
    :is-show-modal="isShowInvite"
    @invite:user="handleInvitation"
    @close="toggleInviteUser"
    data-test="invite-users-modal"
  />
</template>
