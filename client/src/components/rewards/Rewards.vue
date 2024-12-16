<script setup lang="ts">
import type { InsertableReward } from '@server/shared/types';
import { onMounted, ref, computed } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem,} from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import { useUserStore } from '@/stores/userProfile';
import NewRewardModule from './NewRewardModule.vue';
import RewardItem from './RewardItem.vue';

const userGroupStore = useUserGroupsStore()
const userStore = useUserStore()
const isNewReward = ref(false)

const rewards = computed(()=> userGroupStore.rewards)


const toggleAddReward = ()=> {
    isNewReward.value = !isNewReward.value
}

const handleNewReward= async(reward: InsertableReward)=>{
  if(!userGroupStore.activeGroup?.id){
    console.log('no group id')
    return
  }
  console.log('handling reward', reward)
  await userGroupStore.createNewReward(reward)
}

const currentUser = computed(() => {
  const groupMembers = userGroupStore.groupMembers || [];
  const currentUser = userStore.user;

  return currentUser ? groupMembers.find((member) => member.id === currentUser.id)  : undefined
});

</script>
<template>
  <div class="flex flex-col flex-nowrap">
    <FwbDropdown text="Rewards">
      <fwb-list-group class="w-fit">
        <FwbListGroupItem v-for="reward in rewards" :key="reward.id" hover>
            <RewardItem v-if="currentUser" :reward="reward" :member="currentUser"/>
        </FwbListGroupItem>
        <FwbListGroupItem>
          <button
          class="w-full px-4 py-2 font-medium text-green-600 hover:bg-green-50"
          @click="toggleAddReward"
        >
          + Add Reward
        </button>
        </FwbListGroupItem>
      </fwb-list-group>
    </FwbDropdown>
    <div>
      <NewRewardModule :is-show-modal="isNewReward" @reward:new="handleNewReward" @close="toggleAddReward"/>
    </div>
  </div>
</template>

<style scoped></style>
