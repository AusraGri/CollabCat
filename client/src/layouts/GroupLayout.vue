<script setup lang="ts">
import { ref, onMounted, watchEffect, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserGroupsStore } from '@/stores/userGroups'
import { useRouter } from 'vue-router'
import { FwbButton, FwbTabs, FwbTab } from 'flowbite-vue'
import GroupMembers from '@/components/groups/GroupMembers.vue'
import { stringToUrl } from '@/utils/helpers'
import { RouterView } from 'vue-router'
import { useRewardStore } from '@/stores/rewardStore'
import Rewards from '@/components/rewards/Rewards.vue'
import Points from '@/components/points/Points.vue'
import { RouterLink } from 'vue-router'

type TabName = 'tasks' | 'calendar' | 'grades'

const userGroupStore = useUserGroupsStore()
const rewardStore = useRewardStore()
const router = useRouter()
const route = useRoute()
const points = computed(() => userGroupStore.userMembership?.points || 0)
const activeTab = ref<TabName>('tasks')

watchEffect(async () => {
  if (userGroupStore.activeGroup?.name) {
    await rewardStore.manageGroupRewards(userGroupStore.activeGroup?.id)
  }
})

onMounted(async () => {
  await userGroupStore.fetchUserGroups()
})

const handlePaneClick = () => {
  router
    .push({ name: activeTab.value })
    .then(() => {})
    .catch((err) => {
      console.error('Navigation error:', err)
    })
}
</script>
<template>
  <div class="flex flex-col">
    <div class="flex flex-wrap items-center justify-center space-x-1 space-y-1">
      <FwbTabs v-model="activeTab" @click:pane="handlePaneClick" variant="underline" class="p-5">
        <FwbTab name="Tasks" title="Tasks"> </FwbTab>
        <FwbTab name="Calendar" title="Calendar"> </FwbTab>
        <FwbTab name="Grades" title="Grades"> </FwbTab>
      </FwbTabs>
      <div>
        <GroupMembers />
      </div>
      <RouterLink :to="{ name: 'Tasks' }">tasks</RouterLink>
      <div v-if="rewardStore.hasRewards || userGroupStore.isAdmin">
        <Rewards />
      </div>
      <div>
        <FwbButton>Settings</FwbButton>
      </div>
      <div v-if="userGroupStore.hasPoints">
        <Points :points="points" />
      </div>
    </div>
  </div>
  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped></style>
