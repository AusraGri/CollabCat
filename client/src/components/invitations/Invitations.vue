<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { trpc } from '@/trpc'
import { useUserStore, useInvitationStore } from '@/stores'
import { type PublicInvitation, type InvitationData } from '@server/shared/types'
import { FwbListGroup, FwbListGroupItem, FwbAvatar, FwbButton } from 'flowbite-vue'

const { invitation } = defineProps<{
  invitation: PublicInvitation
}>()

const emit = defineEmits<{
  (e: 'invitation:action'): void
}>()

const userStore = useUserStore()
const invitationStore = useInvitationStore()
const invitationData = ref<InvitationData>()

const isInvitationData = computed<Boolean>(() => !!invitationData.value)

const getInvitationData = async (invitationToken: string) => {
  try {
    return await trpc.invitations.getInvitationData.query({ invitationToken })
  } catch (error) {
    console.log('error getting invitation data')
  }
}

onMounted(async () => {
  invitationData.value = await getInvitationData(invitation.invitationToken)
})

const confirmInvitation = async (value: boolean) => {
  try {
    if (value) {
      await invitationStore.acceptInvitation(invitation)
      // await trpc.groups.addUserToGroup.mutate({ groupId: invitation.groupId })
    }

    // await userStore.deleteInvitation(invitation)
    await invitationStore.declineInvitation(invitation)
    invitationData.value = undefined
    emit('invitation:action')
  } catch (error) {
    console.log('error:', error)
  }
}
</script>

<template>
  <div v-if="isInvitationData">
    <FwbListGroup>
      <FwbListGroupItem class="justify-between">
        <div class="flex w-fit flex-col align-middle">
          <div class="border-b-2">{{ invitationData?.groupName }}</div>
          <div class="mt-1 flex w-fit items-center justify-between">
            <div>
              <FwbAvatar :img="invitationData?.groupOwner.picture || undefined" rounded size="sm" />
            </div>
            <div class="w-fit whitespace-nowrap">
              {{ invitationData?.groupOwner.username }}
            </div>
          </div>
        </div>
        <div class="ml-3 flex w-fit flex-col align-middle">
          <FwbButton @click="confirmInvitation(true)" color="green" size="xs" class="m-1"
            >accept</FwbButton
          >
          <FwbButton @click="confirmInvitation(false)" color="pink" size="xs" class="m-1"
            >decline</FwbButton
          >
        </div>
      </FwbListGroupItem>
    </FwbListGroup>
  </div>
</template>

<style scoped></style>
