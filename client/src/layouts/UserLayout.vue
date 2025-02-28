<script setup lang="ts">
import { onMounted, watch, computed, ref } from 'vue'
import { FwbListGroupItem } from 'flowbite-vue'
import UserAvatarMenu from '@/components/user/UserAvatarMenu.vue'
import { RouterView } from 'vue-router'
import {
  useUserStore,
  useCategoriesStore,
  useUserGroupsStore,
  usePointsStore,
  useInvitationStore,
} from '@/stores'
import GroupSelection from '@/components/groups/GroupSelection.vue'
import Invitations from '@/components/invitations/Invitations.vue'
import Notifications from '@/components/user/Notifications.vue'
import { useRouter } from 'vue-router'
import { stringToUrl } from '@/utils/helpers'
import GroupLayout from './GroupLayout.vue'

const router = useRouter()
const pointStore = usePointsStore()
const userStore = useUserStore()
const currentTabName = ref()
const categoryStore = useCategoriesStore()
const userGroupStore = useUserGroupsStore()
const invitationStore = useInvitationStore()
const activeGroupId = computed(() =>
  userGroupStore.activeGroup ? userGroupStore.activeGroup.id : undefined
)
const invitations = computed(() => invitationStore.invitations)

onMounted(async () => {
  await categoryStore.fetchAllCategories()

  if (userGroupStore.activeGroup && activeGroupId.value) {
    await userGroupStore.fetchGroupData()
    await userGroupStore.fetchUserMembershipInfo()
    await categoryStore.getGroupCategories(activeGroupId.value)
  }
  await categoryStore.getUserCategories()
  await refreshInvitations()
  await pointStore.managePoints(activeGroupId.value)
})

const refreshInvitations = async () => {
  await invitationStore.fetchInvitations()
  await userGroupStore.fetchUserGroups()
}

const setTabName = (value: string) => {
  currentTabName.value = value
}

watch(
  () => userGroupStore.activeGroup,
  async (newGroup, oldGroup) => {
    const isNewValue = newGroup?.id !== oldGroup?.id && !!newGroup
    const tab = currentTabName.value || 'Calendar'

    if (userGroupStore.activeGroup === null && userStore.user) {
      router.push({ name: `Personal${tab}` })
    }

    if (isNewValue && activeGroupId.value) {
      const groupName = stringToUrl(newGroup.name)

      router.push({ name: tab, params: { group: groupName } })

      await userGroupStore.fetchGroupData()
      await categoryStore.getGroupCategories(activeGroupId.value)
      await userGroupStore.fetchUserMembershipInfo()
    }

    await pointStore.managePoints(activeGroupId.value)
  }
)
</script>

<template>
  <div>
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
    <GroupLayout @tab:new="setTabName" />
    <main aria-live="polite">
      <div class="container mx-auto">
        <RouterView />
      </div>
    </main>
  </div>
</template>
