<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { FwbButton, FwbListGroupItem } from 'flowbite-vue'
import UserAvatarMenu from '@/components/user/UserAvatarMenu.vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/userProfile'
import { useUserGroupsStore } from '@/stores/userGroups'
import GroupSelection from '@/components/groups/GroupSelection.vue'
import { stringToUrl } from '@/utils/helpers'
import { useRouter } from 'vue-router'
import GroupLayout from './GroupLayout.vue'
import Invitations from '@/components/invitations/Invitations.vue'
import Notifications from '@/components/user/Notifications.vue'
import NotificationList from '@/components/user/NotificationList.vue'
import { type PublicInvitation } from '@server/shared/types'

const router = useRouter()
const userStore = useUserStore()
const userGroupStore = useUserGroupsStore()
const invitations = computed(() => userStore.invitations)

onMounted(async () => {
  await userGroupStore.fetchUserGroups()

  if (userGroupStore.activeGroup) {
    await userGroupStore.fetchGroupData()
  }
  await refreshInvitations()
})

const refreshInvitations = async () => {
  await userStore.fetchInvitations()
}
</script>

<template>
  <div
    v-if="userStore.user"
    class="mb-1 mt-1 flex items-center justify-between border-b border-t border-gray-200 bg-gray-50 p-3"
  >
    <UserAvatarMenu :user="userStore.user" />
    <GroupSelection />
    <Notifications :has-notifications="!!invitations?.length">
      <template #notifications>
        <FwbListGroupItem
          class="flex flex-col space-y-2 bg-gray-100 p-4 dark:bg-gray-700"
          v-for="invitation in invitations"
          :key="invitation.id"
        >
          <Invitations :invitation="invitation" @invitation:action="refreshInvitations" />
        </FwbListGroupItem>
      </template>
    </Notifications>
  </div>
  <GroupLayout v-if="userGroupStore.isInGroup" />
  <main>
    <div class="container mx-auto px-6 py-6">
      <RouterView />
    </div>
  </main>
</template>
<style scoped></style>
