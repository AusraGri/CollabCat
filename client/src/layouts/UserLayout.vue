<script setup lang="ts">
import { ref, onMounted, watch, computed, watchEffect } from 'vue'
import { FwbButton, FwbListGroupItem } from 'flowbite-vue'
import UserAvatarMenu from '@/components/user/UserAvatarMenu.vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/userProfile'
import { useUserGroupsStore } from '@/stores/userGroups'
import GroupSelection from '@/components/groups/GroupSelection.vue'
import GroupLayout from './GroupLayout.vue'
import Invitations from '@/components/invitations/Invitations.vue'
import Notifications from '@/components/user/Notifications.vue'
import { useRouter } from 'vue-router'
import { stringToUrl } from '@/utils/helpers'

const router = useRouter()
const userStore = useUserStore()
const userGroupStore = useUserGroupsStore()
const invitations = computed(() => userStore.invitations)

onMounted(async () => {
  if (userGroupStore.activeGroup) {
    await userGroupStore.fetchGroupData()
  }
  await refreshInvitations()
})

const refreshInvitations = async () => {
  await userStore.fetchInvitations()
}
watch(
  () => userGroupStore.activeGroup?.name,
  async (newGroupName, oldGroupName) => {
    if (newGroupName !== oldGroupName && newGroupName) {
      const groupName = stringToUrl(newGroupName)

      router.push({ name: 'Group', params: { group: groupName } })

      await userGroupStore.fetchGroupData()
      await userGroupStore.fetchUserMembershipInfo()
    }
  }
)
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
  <main>
    <div class="container">
      <RouterView />
    </div>
  </main>
</template>
<style scoped></style>
