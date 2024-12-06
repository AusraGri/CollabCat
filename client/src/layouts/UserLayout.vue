<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FwbButton} from 'flowbite-vue'
import UserAvatarMenu from '@/components/user/UserAvatarMenu.vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/userProfile'
import { useUserGroupsStore } from '@/stores/userGroups'
import GroupSelection from '@/components/groups/GroupSelection.vue'

const userStore = useUserStore()
const userGroupStore = useUserGroupsStore()
const userGroups = ref()

onMounted(async()=>{
 await  userGroupStore.fetchUserGroupsData()
} )



</script>

<template>
  <div v-if="userStore.user" class="flex items-center justify-between p-3 mt-3 mb-3 border-t border-b border-gray-200 bg-gray-50">
    <UserAvatarMenu :user="userStore.user" />
    <FwbButton pill size="sm" class="h-10 w-10">S</FwbButton>
    <GroupSelection :groups="userGroupStore.userGroups || []"/>
  </div>
  <main>
    <div class="container mx-auto px-6 py-6">
      <RouterView />
    </div>
  </main>
</template>
<style scoped></style>
