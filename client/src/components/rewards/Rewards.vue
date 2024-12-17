<script setup lang="ts">
import type { InsertableReward, PublicReward, GroupMember} from '@server/shared/types'
import { onMounted, ref, computed } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import { useUserStore } from '@/stores/userProfile'
import NewRewardModule from './NewRewardModule.vue'
import RewardItem from './RewardItem.vue'

const { rewards, member } = defineProps<{
  rewards: PublicReward[]
  member: GroupMember
  claimers?: GroupMember []
}>()

const userGroupStore = useUserGroupsStore()
const userStore = useUserStore()
const isNewReward = ref(false)


// prop for rewards and user
// set rewards into reward store. each group or user fetch data will provide new rewards. 
// const rewards = computed(() => userGroupStore.rewards)

const isShowRewards = computed(() => {
  const isRewards = rewards ? rewards.length > 0 : false
  const isAdmin = member.role ? member.role === 'Admin' : false

  return isAdmin || isRewards
})

const toggleAddReward = () => {
  isNewReward.value = !isNewReward.value
}

const handleNewReward = async (reward: InsertableReward) => {
  if (!userGroupStore.activeGroup?.id) {
    console.log('no group id')
    return
  }
  console.log('handling reward', reward)
  await userGroupStore.createNewReward(reward)
}
// better get the user data in the user store or assign userMembership from userGroups
// const currentUser = computed(() => {
//   const groupMembers = userGroupStore.groupMembers || []
//   const currentUser = userStore.user

//   return currentUser ? groupMembers.find((member) => member.id === currentUser.id) : undefined
// })
const currentUser = computed(() => {
  // return userGroupStore.userMembership
  return member
})

const handleRewardChange = ({ reward, action }: { reward: PublicReward; action: 'delete' | 'edit' | 'claim' }) => {
  switch (action) {
    case 'delete':
      // Handle delete
      break;
    case 'edit':
      // Handle edit
      break;
    case 'claim':
      // Handle claim
      break;
    default:
      console.error('Unknown action');
  }
};
</script>
<template>
  <div v-if="isShowRewards" class="flex flex-col flex-nowrap">
    <FwbDropdown text="Rewards">
      <fwb-list-group class="w-fit">
        <FwbListGroupItem v-for="reward in rewards" :key="reward.id" hover>
          <RewardItem v-if="currentUser" :reward="reward" :member="currentUser" @reward:change="handleRewardChange" />
        </FwbListGroupItem>
        <FwbListGroupItem>
          <button
            class="w-full px-4 py-2 whitespace-nowrap font-medium text-green-600 hover:bg-green-50"
            @click="toggleAddReward"
          >
            + Add Reward
          </button>
        </FwbListGroupItem>
      </fwb-list-group>
    </FwbDropdown>
    <div>
      <NewRewardModule
        :is-show-modal="isNewReward"
        @reward:new="handleNewReward"
        @close="toggleAddReward"
      />
    </div>
  </div>
</template>

<style scoped></style>
