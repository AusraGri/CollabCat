<script setup lang="ts">
import { onMounted, ref, watchEffect, computed } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbAvatar } from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import InviteUsers from './InviteUsers.vue'

const userGroupStore = useUserGroupsStore()
const isShowInvite = ref(false)
const members = computed(()=>userGroupStore.groupMembers)

const openMemberSettings = () => {
  if(!userGroupStore.isAdmin) return

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
      <span class=" self-center p-3 bg-slate-300 rounded cursor-pointer hover:bg-blue-100">
        Members
      </span>
    </template>
      <fwb-list-group>
        <FwbListGroupItem v-for="member in members" :key="member.id" hover>
          <button @click="openMemberSettings">
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
          >
            + Invite User
          </button>
        </FwbListGroupItem>
      </fwb-list-group>
    </FwbDropdown>
    <InviteUsers
      :is-show-modal="isShowInvite"
      @invite:user="handleInvitation"
      @close="toggleInviteUser"
    />
  </div>
</template>

<style scoped></style>
