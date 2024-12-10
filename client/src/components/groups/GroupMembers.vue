<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbAvatar } from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import InviteUsers from './InviteUsers.vue'

const userGroupStore = useUserGroupsStore()
const isShowInvite = ref(false)

const members = ref()

onMounted(async () => {
  await userGroupStore.getGroupMembers()
  members.value = userGroupStore.groupMembers
})

watchEffect(async () => {
  if (userGroupStore.activeGroup?.name) {
    await userGroupStore.getGroupMembers()
    members.value = userGroupStore.groupMembers
  }
})

const toggleInviteUser = () => {
  isShowInvite.value = !isShowInvite.value
}

const handleInvitation = async (email: string) => {
  console.log('handling invitation', email)

  if (!userGroupStore.activeGroup?.id) {
    console.log('no group id')

    return
  }

  await userGroupStore.inviteUser(email)
}
</script>
<template>
  <div class="w-full">
    <FwbDropdown text="Members">
      <fwb-list-group>
        <FwbListGroupItem v-for="member in members" :key="member" hover>
          <FwbAvatar :img="member.picture" rounded size="md" />
          <div class="ml-2">{{ member.username }}</div>
        </FwbListGroupItem>
        <FwbListGroupItem>
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
