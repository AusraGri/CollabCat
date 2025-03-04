<script setup lang="ts">
import { ref } from 'vue'
import { FwbListGroupItem, FwbCheckbox } from 'flowbite-vue'
import type { UserPublic } from '@server/shared/types'

const { user } = defineProps<{
  user: UserPublic
}>()

const picked = ref()
</script>

<template>
  <FwbListGroupItem>
    <FwbCheckbox
      v-model="picked"
      label="User"
      name="list-radio"
      :value="user.id"
      aria-label="Select user"
      data-test="user-checkbox"
      data-test-user-id="user.id"
    />
  </FwbListGroupItem>
</template>
