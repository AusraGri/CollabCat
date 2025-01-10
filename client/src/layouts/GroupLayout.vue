<script setup lang="ts">
import { ref, onMounted, watchEffect, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserGroupsStore, UserStore, useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { FwbButton, FwbTabs, FwbTab, FwbNavbar, FwbNavbarCollapse, FwbNavbarLink } from 'flowbite-vue'
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
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const userClaimInfo = computed(()=> {
  const member  = userGroupStore.userMembership

  let points: number
  let userId: number
  if(route.meta.group && member){
    points = member.points || 0
    userId = member.id

    return {points, userId}
  }

  if(route.meta.personal && userStore.user){
    points = userStore.points || 0
    userId = userStore.user?.id
    return {points, userId}
  }

  return undefined
})
const points = computed(() => userGroupStore.userMembership?.points || 0)
const activeTab = ref<TabName>('tasks')
const isUserInGroupPage = computed(()=> route.meta.group)

watchEffect(async () => {
  if (userGroupStore.activeGroup?.name) {
    await rewardStore.manageGroupRewards(userGroupStore.activeGroup?.id)
    return
  }
  await rewardStore.managePersonalRewards()
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
  <div class="flex flex-col divide-x-2 mb-1 w-full">
    <div class="flex flex-wrap items-center  space-x-1 space-y-1 w-full justify-center">
      <FwbTabs v-model="activeTab" @click:pane="handlePaneClick" variant="underline" class="p-5">
        <FwbTab name="Calendar" title="Calendar"> </FwbTab>
        <FwbTab name="Tasks" title="Tasks"> </FwbTab>
      </FwbTabs>
      <div>
        <GroupMembers />
      </div>
      <div v-if="rewardStore.hasRewards">
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
  <div class="container mx-auto">
    <RouterView />
  </div>
</template>

<style scoped></style>
