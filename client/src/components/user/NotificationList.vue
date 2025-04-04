<script setup lang="ts">
import { FwbListGroupItem, FwbListGroup } from 'flowbite-vue'

defineProps({
  notifications: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <FwbListGroup>
    <FwbListGroupItem v-for="(notification, index) in notifications" :key="index">
      <div
        class="w-full min-w-fit px-4 py-2 text-sm"
        aria-label="Notification"
        data-test="notification"
      >
        {{ notification }}
      </div>
    </FwbListGroupItem>
  </FwbListGroup>
</template>
