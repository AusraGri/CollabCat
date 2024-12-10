<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbAvatar} from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import InviteUsers from './InviteUsers.vue';
import { trpc } from '@/trpc';

const userGroupStore = useUserGroupsStore()
const isShowInvite = ref(false)

const members = ref()

onMounted(async () => {
  await userGroupStore.getGroupMembers()
  members.value = userGroupStore.groupMembers
})

const toggleAddReward = ()=> {
    isShowInvite.value = !isShowInvite.value
}

const handleInvitation = async(email:string)=>{
    console.log('handling invitation', email)
//    const invitation =  await userGroupStore.inviteUser(email)
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
    <FwbDropdown text="Members">
      <fwb-list-group>
        <FwbListGroupItem v-for="member in members" :key="member" hover >
            <FwbAvatar :img="member.picture" rounded size="md"/>
            <div class="ml-2">{{ member.username }}</div>
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
    <InviteUsers :is-show-modal="isShowInvite" @invite:user="handleInvitation" @close="toggleInviteUser"/>
  </div>
</template>

<style scoped></style>
