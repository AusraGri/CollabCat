<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { UserPublic, type GroupsPublic, type PublicInvitation } from '@server/shared/types'
import { FwbListGroup, FwbListGroupItem, FwbAvatar, FwbButton } from 'flowbite-vue'
import { useInvitationStore } from '../../stores/invitationStore'

const { invitation } = defineProps<{
  invitation: PublicInvitation
}>()

const invitationStore = useInvitationStore()
const group = ref<GroupsPublic>()
const inviter = ref<UserPublic>()

const isInvitationData = computed<Boolean>(() => !!(group.value && inviter.value))

onMounted(async () => {
  invitationStore.invitationToken = invitation.invitationToken
  try {
    await invitationStore.validateInvitationToken()
  } catch {
    await invitationStore.deleteInvitation()
  }

  if (invitationStore.invitationToken) {
    group.value = await invitationStore.getGroupData()
    inviter.value = await invitationStore.getInviterData()
  }
})
</script>

<template>
  <div v-if="isInvitationData">
    <FwbListGroup>
      <FwbListGroupItem class="justify-between">
        <div class="flex w-fit flex-col align-middle">
          <div class="border-b-2">{{ group?.name }}</div>
          <div class="mt-1 flex w-fit items-center justify-between">
            <div>
              <FwbAvatar :img="inviter?.picture || undefined" rounded size="sm" />
            </div>
            <div class="w-fit whitespace-nowrap">
              {{ inviter?.username }}
            </div>
          </div>
        </div>
        <div class="ml-3 flex w-fit flex-col align-middle">
          <FwbButton color="green" size="xs" class="m-1">accept</FwbButton>
          <FwbButton color="pink" size="xs" class="m-1">decline</FwbButton>
        </div>
      </FwbListGroupItem>
    </FwbListGroup>
  </div>
</template>

<style scoped></style>
