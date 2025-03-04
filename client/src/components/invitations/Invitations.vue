<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { trpc } from '@/trpc'
import { useInvitationStore, useUserGroupsStore } from '@/stores'
import { type PublicInvitation, type InvitationData } from '@server/shared/types'
import { FwbAvatar, FwbButton } from 'flowbite-vue'
import { setErrorMessage } from '@/utils/error'

const { invitation } = defineProps<{
  invitation: PublicInvitation
}>()

const emit = defineEmits<{
  (e: 'invitation:action'): void
}>()

const invitationStore = useInvitationStore()
const userGroupStore = useUserGroupsStore()
const invitationData = ref<InvitationData>()

const isInvitationData = computed<Boolean>(() => !!invitationData.value)

const getInvitationData = async (invitationToken: string) => {
  try {
    return await trpc.invitations.getInvitationData.query({ invitationToken })
  } catch (error) {
    setErrorMessage({message: 'Ooops! Something went wrong while trying to get the invitation data'})
  }
}

onMounted(async () => {
  invitationData.value = await getInvitationData(invitation.invitationToken)
})

const confirmInvitation = async (value: boolean) => {
  if (value) {
    await invitationStore.acceptInvitation(invitation)
  } else if (!value){
    await invitationStore.declineInvitation(invitation)
  }
  await userGroupStore.fetchUserGroups()
  invitationData.value = undefined
  emit('invitation:action')
}
</script>

<template>
  <div v-if="isInvitationData" aria-live="polite">
    <div class="m-1 flex w-full min-w-fit space-x-4 p-1">
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
