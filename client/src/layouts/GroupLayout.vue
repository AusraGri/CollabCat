<script setup lang="ts">
import { ref, onMounted, watchEffect, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserGroupsStore, useUserStore, usePointsStore } from '@/stores'
import { useRouter } from 'vue-router'
import GroupMembers from '@/components/groups/GroupMembers.vue'
// import { RouterView } from 'vue-router'
import { useRewardStore } from '@/stores/rewardStore'
import Rewards from '@/components/rewards/Rewards.vue'
import GroupSettings from '@/components/groups/GroupSettings.vue'
import Tab from '@/components/Tab.vue'


const userGroupStore = useUserGroupsStore()
const rewardStore = useRewardStore()
const userStore = useUserStore()
const pointsStore = usePointsStore()
const router = useRouter()
const route = useRoute()
const isShowGroupSettings = ref(false)
const activeTab = ref<any>(route.name?.toString().replace(/^Personal/, ''))
const isUserInGroupPage = computed(() => route.meta.group)
// const isAdmin = computed(() => {
//   if (isUserInGroupPage.value) {
//     return userGroupStore.isAdmin
//   }

//   return true
// })

watchEffect(async () => {
  if (userGroupStore.activeGroup?.name && isUserInGroupPage.value) {
    await rewardStore.manageGroupRewards(userGroupStore.activeGroup?.id)
    return
  }

  if (userStore.user && !isUserInGroupPage.value) {
    const userInfo = {
      ...userStore.user,
      points: pointsStore.userPoints || 0,
      role: 'Admin',
    }
    await rewardStore.managePersonalRewards(userInfo)
  }
})

watch(
  () => route.name,
  (newName) => {
    const tab = newName?.toString().replace(/^Personal/, '')
    activeTab.value = tab
  }
)

const handleRewardClaim = (data: { cost: number }) => {
  const userPoints = pointsStore.userPoints
  if (userPoints > data.cost) {
    const updatedPoints = userPoints - data.cost
    pointsStore.setPoints(updatedPoints)
  }
}

const openGroupSettings = () => {
  isShowGroupSettings.value = true
}

function handleTabClick(tabName: string) {
  activeTab.value = tabName

  if (isUserInGroupPage.value) {
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

onMounted(async ()=>{
  const tab =  route.name ? route.name.toString().replace(/^Personal/, '') :  'Calendar'
  activeTab.value =  tab

  if (userGroupStore.activeGroup?.name && isUserInGroupPage.value) {
    await rewardStore.manageGroupRewards(userGroupStore.activeGroup?.id)
    return
  }

  if (userStore.user && !isUserInGroupPage.value) {
    const userInfo = {
      ...userStore.user,
      points: pointsStore.userPoints || 0,
      role: 'Admin',
    }
    await rewardStore.managePersonalRewards(userInfo)
  }

})
</script>
<template>
  <div class=" flex flex-col">
    <div :class="['flex','justify-end','pr-3', {'border-r-2 border-gray-300' : isUserInGroupPage}]">
      <div class=" inline-flex space-x-2 w-96">
        <Tab :title="'Calendar'" :isActive="activeTab" @tab-click="handleTabClick" />
        <Tab :title="'Tasks'" :isActive="activeTab" @tab-click="handleTabClick" />
        <Rewards @reward:claimed="handleRewardClaim">
          <template #trigger>
            <Tab :title="'Rewards'" :custom-tailwind-classes="'border-red-500'"/>
          </template>
        </Rewards>
      </div>
    </div>
    <div :class="['flex', 'w-full', 'flex-nowrap', 'h-9', 'justify-end']">
      <div v-if="isUserInGroupPage" class="inline-flex space-x-1">
        <div>
          <GroupMembers>
            <template #trigger>
              <Tab :title="'Members'" :custom-tailwind-classes="'border-green-400'" />
            </template>
          </GroupMembers>
        </div>
        <div>
          <Tab :title="'Settings'" @tab-click="openGroupSettings" :custom-tailwind-classes="'border-gray-300 text-gray-500'"/>
          <GroupSettings :is-show-modal="isShowGroupSettings" @close="isShowGroupSettings = false" />
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="container mx-auto">
    <RouterView />
  </div> -->
</template>

<style scoped></style>
