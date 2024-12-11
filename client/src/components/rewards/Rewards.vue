<script setup lang="ts">
import type { InsertableReward } from '@server/shared/types';
import { onMounted, ref, computed } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem,} from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import { trpc } from '@/trpc';
import NewRewardModule from './NewRewardModule.vue';

const userGroupStore = useUserGroupsStore()
const isNewReward = ref(false)

const rewards = computed(()=> userGroupStore.rewards)


const toggleAddReward = ()=> {
    isNewReward.value = !isNewReward.value
}

const handleNewReward= async(reward: InsertableReward)=>{
    console.log('handling invitation', reward)
    await userGroupStore.createNewReward(reward)
if(!userGroupStore.activeGroup?.id){
    console.log('no group id')
    return
}

const invitation = await trpc.groups.inviteUser.mutate({groupId: userGroupStore.activeGroup?.id, email: 'dmforlove@yahoo.com'})
   console.log('invitation', invitation)
}
</script>
<template>
  <div class="w-full">
    <FwbDropdown text="Rewards">
      <fwb-list-group>
        <FwbListGroupItem v-for="reward in rewards" :key="reward.id" hover >
            <div class="ml-2">{{ reward.title }}</div>
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
    <NewRewardModule :is-show-modal="isNewReward" @reward:new="handleNewReward" @close="toggleAddReward"/>
  </div>
</template>

<style scoped></style>
