<script setup lang="ts">
import { ref, onMounted, watch, computed, watchEffect } from 'vue'
import { FwbButton, FwbListGroupItem } from 'flowbite-vue'
import UserAvatarMenu from '@/components/user/UserAvatarMenu.vue'
import { RouterView } from 'vue-router'
import { useUserStore, useTasksStore, useUserGroupsStore, usePointsStore } from '@/stores'
import GroupSelection from '@/components/groups/GroupSelection.vue'
import Invitations from '@/components/invitations/Invitations.vue'
import Notifications from '@/components/user/Notifications.vue'
import { useRouter, useRoute } from 'vue-router'
import { stringToUrl } from '@/utils/helpers'
import Points from '@/components/points/Points.vue'

const router = useRouter()
const route = useRoute()
const taskStore = useTasksStore()
const pointStore = usePointsStore()
const userStore = useUserStore()
const userGroupStore = useUserGroupsStore()
const activeGroupId = computed(() =>
  userGroupStore.activeGroup ? userGroupStore.activeGroup.id : undefined
)
const invitations = computed(() => userStore.invitations)
const isUserInGroupPage = computed(() => route.meta.group)

onMounted(async () => {
  if (userGroupStore.activeGroup) {
    await userGroupStore.fetchGroupData()
    await userGroupStore.fetchUserMembershipInfo()
  }
  await refreshInvitations()
  await userStore.fetchUserTasks()
  await pointStore.managePoints(activeGroupId.value)
})

const refreshInvitations = async () => {
  await userStore.fetchInvitations()
  await userGroupStore.fetchUserGroups()
}
watch(
  () => userGroupStore.activeGroup?.name,
  async (newGroupName, oldGroupName) => {

    const isNewValue = newGroupName !== oldGroupName && newGroupName
    if (userGroupStore.activeGroup === null) {
      router.push({ name: 'PersonalCalendar' })
    }

    if (isNewValue && userGroupStore.activeGroup) {
      const groupName = stringToUrl(newGroupName)
      const currentTab = 'Calendar'

      router.push({ name: currentTab, params: { group: groupName } })

      await userGroupStore.fetchGroupData()
      await userGroupStore.fetchUserMembershipInfo()
    }

    await pointStore.managePoints(activeGroupId.value)
  }
)
</script>

<template>
  <div
    v-if="userStore.user"
    class="mt-1 flex items-center justify-center border-b border-t border-gray-200 bg-gray-50 p-3"
  >
    <div class="flex max-w-screen-lg grow items-center justify-between">
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
  </div>
  <main>
    <div class="container mx-auto w-full">
      <RouterView />
    </div>
  </main>
</template>
<style scoped></style>
