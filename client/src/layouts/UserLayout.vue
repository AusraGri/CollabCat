<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { FwbButton} from 'flowbite-vue'
import UserAvatarMenu from '@/components/user/UserAvatarMenu.vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/userProfile'
import { useUserGroupsStore } from '@/stores/userGroups'
import GroupSelection from '@/components/groups/GroupSelection.vue'
import { stringToUrl } from '@/utils/helpers'
import { useRouter } from 'vue-router'
import GroupLayout from './GroupLayout.vue'
import Invitations from '@/components/invitations/Invitations.vue'

const router = useRouter()
const userStore = useUserStore()
const userGroupStore = useUserGroupsStore()
const invitations = ref()

onMounted(async()=>{
 await userGroupStore.fetchUserGroupsData()
 invitations.value = await userStore.fetchInvitations()
})

// watchEffect(async () => {
//     if (userGroupStore.activeGroup?.name) {
//       const groupName = stringToUrl(userGroupStore.activeGroup.name);
//       router.push({ name: 'Group', params: { group: groupName } });

//       await userGroupStore.fetchUserGroupsData()
//       await userGroupStore.getGroupMembers()
//     }
//   });

</script>

<template>
  <div>{{ userStore.invitations }}</div>
  <div v-if="userStore.user" class="flex items-center justify-between p-3 mt-3 mb-3 border-t border-b border-gray-200 bg-gray-50">
    <UserAvatarMenu :user="userStore.user" />
    <GroupSelection/>
    <div v-if="userStore.invitations" >
      <div v-for="invitation in invitations" :key="invitation.id">
        <Invitations  :invitation="invitation"/>
      </div>
    </div>
  </div>
<div>
  <GroupLayout v-if="userGroupStore.isInGroup"/>
</div>
  <main>
    <div class="container mx-auto px-6 py-6">
      <RouterView />
    </div>
  </main>
</template>
<style scoped></style>
