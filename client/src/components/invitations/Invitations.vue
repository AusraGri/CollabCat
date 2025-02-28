<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { trpc } from '@/trpc'
import { useInvitationStore } from '@/stores'
import { type PublicInvitation, type InvitationData } from '@server/shared/types'
import {  FwbAvatar, FwbButton } from 'flowbite-vue'

const { invitation } = defineProps<{
  invitation: PublicInvitation
}>()

const emit = defineEmits<{
  (e: 'invitation:action'): void
}>()

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
    }

    await invitationStore.declineInvitation(invitation)
    invitationData.value = undefined
    emit('invitation:action')
  } catch (error) {
    console.log('error:', error)
  }
}
</script>

<template>
  <div v-if="isInvitationData" aria-live="polite" >
      <div class="flex space-x-4 w-full min-w-fit m-1 p-1">
        <div class="flex w-fit flex-col align-middle">
          <div
            class="border-b-2"
            id="group-name"
            :aria-label="`Group Name: ${invitationData?.groupName}`"
          >
            {{ invitationData?.groupName }}
          </div>
          <div class="mt-1 flex w-fit items-center justify-between">
            <div>
              <FwbAvatar
                :img="invitationData?.groupOwner.picture || undefined"
                rounded
                size="sm"
                alt="Group Owner Avatar: {{ invitationData?.groupOwner.username }}"
              />
            </div>
            <div
              class="w-fit whitespace-nowrap"
              id="group-owner-username"
              :aria-label="`Group owner: ${invitationData?.groupOwner.username}`"
            >
              {{ invitationData?.groupOwner.username }}
            </div>
          </div>
        </div>
        <div class="ml-3 flex w-fit flex-col align-middle">
          <FwbButton
            @click="confirmInvitation(true)"
            color="green"
            size="xs"
            class="m-1"
            :aria-label="`Accept invitation to join ${invitationData?.groupName}`"
            data-test="accept-invitation-button"
            >accept</FwbButton
          >
          <FwbButton
            @click="confirmInvitation(false)"
            color="pink"
            size="xs"
            class="m-1"
            :aria-label="`Decline invitation to join ${invitationData?.groupName}`"
            data-test="decline-invitation-button"
            >decline</FwbButton
          >
        </div>
      </div>
  </div>
</template>
