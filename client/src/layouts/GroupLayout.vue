<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import { useRouter } from 'vue-router'
import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbButton } from 'flowbite-vue'
import GroupMembers from '@/components/groups/GroupMembers.vue';
import { stringToUrl } from '@/utils/helpers'

const userGroupStore = useUserGroupsStore()
const router = useRouter()

watchEffect(async () => {
    if (userGroupStore.activeGroup?.name) {
      const groupName = stringToUrl(userGroupStore.activeGroup.name);
      router.push({ name: 'Group', params: { group: groupName } });
    }
  });

  onMounted(async()=>{
 await userGroupStore.fetchUserGroupsData()
})
</script>
<template>
  <div class="flex">
    <div>
      <!-- Show invited users in the same dropdown -->
       <GroupMembers/>
    </div>
    <!-- Available rewards names. detailed info can be shown in modal -->
    <div>Rewards</div>
    <!-- Settings: group name, member roles, delete group -->
    <div>
      <FwbButton>Settings</FwbButton>
    </div>
    <!-- just show points -->
    <div>Points</div>
    <div>
      <FwbButton color="red">Grades</FwbButton>
    </div>
  </div>
</template>

<style scoped></style>
