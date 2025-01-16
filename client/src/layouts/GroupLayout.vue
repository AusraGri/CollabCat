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
import GroupSettings from '@/components/groups/GroupSettings.vue'

// type TabName = 'Tasks' | 'Calendar'

const userGroupStore = useUserGroupsStore()
const rewardStore = useRewardStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const isShowGroupSettings = ref(false)
const points = computed(() => {
  if(isUserInGroupPage.value){
    return userGroupStore.userMembership?.points || 0
  }

  return userStore.points || 0
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
  if (userGroupStore.activeGroup?.name && isUserInGroupPage.value) {
    await rewardStore.manageGroupRewards(userGroupStore.activeGroup?.id)
    return
  }

  if (userStore.user && !isUserInGroupPage.value) {
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

const handleRewardClaim = (data: {cost: number, groupId: number | undefined}) => {
  const groupMemberPoints = userGroupStore.userMembership?.points

  if(data.groupId && groupMemberPoints){
    const updatedPoints = groupMemberPoints - data.cost
    userGroupStore.setMemberPoints(updatedPoints)
  }else{
    userStore.points = userStore.points ? userStore.points - data.cost : null
  }
}
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

const openGroupSettings = () => {
  isShowGroupSettings.value = true
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
        <Rewards @reward:claimed="handleRewardClaim"/>
      </div>
      <div v-if="isUserInGroupPage">
        <FwbButton @click="openGroupSettings">Settings</FwbButton>
        <GroupSettings :is-show-modal="isShowGroupSettings" @close="isShowGroupSettings = false" />
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
