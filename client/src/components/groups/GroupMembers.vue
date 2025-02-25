<script setup lang="ts">
import { ref, computed } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbAvatar } from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores'
import InviteUsers from './InviteUsers.vue'

const userGroupStore = useUserGroupsStore()
const isShowInvite = ref(false)
const members = computed(() => userGroupStore.groupMembers)

const openMemberSettings = () => {
  if (!userGroupStore.isAdmin) return

  console.log('opening settings...')
}

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
  <div class="w-full">
    <FwbDropdown>
      <template #trigger>
        <slot name="trigger"></slot>
      </template>
      <FwbListGroup>
        <FwbListGroupItem v-for="member in members" :key="member.id" hover>
          <button
            @click="openMemberSettings"
            data-test="member-settings-button"
            aria-label="Open settings for {{ member.username }}"
          >
            <div class="flex items-center">
              <FwbAvatar :img="member.picture || undefined" rounded size="md" />
              <div class="ml-2">{{ member.username }}</div>
            </div>
          </button>
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
  </div>
</template>
