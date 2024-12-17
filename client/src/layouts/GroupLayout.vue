<script setup lang="ts">
import { ref, onMounted, watchEffect, computed } from 'vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import { useRouter } from 'vue-router'
import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbButton } from 'flowbite-vue'
import GroupMembers from '@/components/groups/GroupMembers.vue';
import { stringToUrl } from '@/utils/helpers'
import { useRewardStore } from '@/stores/rewardStore';
import Rewards from '@/components/rewards/Rewards.vue';

const userGroupStore = useUserGroupsStore()
const rewardStore = useRewardStore()
const router = useRouter()

const rewards = computed(()=> userGroupStore.rewards)
const member = computed(()=> userGroupStore.userMembership)
const claimers = computed(()=> userGroupStore.groupMembers ?? undefined)

watchEffect(async () => {
    if (userGroupStore.activeGroup?.name) {
      const groupName = stringToUrl(userGroupStore.activeGroup.name);
      router.push({ name: 'Group', params: { group: groupName } });
      await rewardStore.manageGroupRewards(userGroupStore.activeGroup?.id)
    }
    await userGroupStore.fetchUserGroups()
    await userGroupStore.fetchGroupData()
    await userGroupStore.fetchUserMembershipInfo()

  });

  onMounted(async()=>{
 await userGroupStore.fetchUserGroups()
})
</script>
<template>
  <div>
    reward store: {{ rewardStore.hasRewards }} {{ rewardStore.rewards}} {{ rewardStore.claimers }}
  </div>
  <div> active user {{rewardStore.activeUser}}</div>
  <div class="flex">
    <div>
      <!-- Show invited users in the same dropdown -->
       <GroupMembers/>
    </div>
    <!-- Available rewards names. detailed info can be shown in modal -->
    <div v-if="rewards && member">
      <Rewards :rewards="rewards" :member="member" :claimers="claimers" />
    </div>
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
