<script setup lang="ts">
import { ref, onMounted, watchEffect, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserGroupsStore, useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { FwbButton, FwbTabs, FwbTab } from 'flowbite-vue'
import GroupMembers from '@/components/groups/GroupMembers.vue'
import { RouterView } from 'vue-router'
import { useRewardStore } from '@/stores/rewardStore'
import Rewards from '@/components/rewards/Rewards.vue'
import Points from '@/components/points/Points.vue'

// type TabName = 'Tasks' | 'Calendar'

const userGroupStore = useUserGroupsStore()
const rewardStore = useRewardStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const points = computed(() => {
  if(isUserInGroupPage.value){
    return userGroupStore.userMembership?.points || 0
  }

  return userStore.points
})
const activeTab = ref<any>(route.name?.toString().replace(/^Personal/, ''))
const isUserInGroupPage = computed(() => route.meta.group)
const isAdmin = computed(() => {
  if (isUserInGroupPage.value) {
    return userGroupStore.isAdmin
  }

  return true
})

watchEffect(async () => {
  if (userGroupStore.activeGroup?.name) {
    await rewardStore.manageGroupRewards(userGroupStore.activeGroup?.id)
    return
  }

  if (userStore.user) {
    const userInfo = {
      ...userStore.user,
      points: userStore.points || 0,
      role: 'Admin',
    }
    await rewardStore.managePersonalRewards(userInfo)
  }
})

watch(()=> route.name, (newName)=>{
  const tab  = newName?.toString().replace(/^Personal/, '')
  activeTab.value = tab
})

// onMounted(async () => {
//   await userGroupStore.fetchUserGroups()
// })

const handlePaneClick = () => {
  if(isUserInGroupPage.value){
    router
      .push({ name: activeTab.value })
      .then(() => {})
      .catch((err) => {
        console.error('Navigation error:', err)
      })
      return
  }
  router
      .push({ name: `Personal${activeTab.value}` })
      .then(() => {})
      .catch((err) => {
        console.error('Navigation error:', err)
      })

}
</script>
<template>
  <div class="mb-1 flex w-full flex-col divide-x-2">
    <div class="flex w-full flex-wrap items-center justify-center space-x-1 space-y-1">
      <FwbTabs v-model="activeTab" @click:pane="handlePaneClick" variant="underline" class="p-5">
        <FwbTab name="Calendar" title="Calendar"> </FwbTab>
        <FwbTab name="Tasks" title="Tasks"> </FwbTab>
      </FwbTabs>
      <div v-if="isUserInGroupPage">
        <GroupMembers />
      </div>
      <div>
        <Rewards />
      </div>
      <div v-if="isAdmin">
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
