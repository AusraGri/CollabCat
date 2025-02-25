<!-- NotificationList.vue -->
<script setup lang="ts">
defineProps({
  notifications: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div aria-live="polite">
    <FwbListGroup>
      <FwbListGroupItem v-for="(notification, index) in notifications" :key="index">
        <div class="px-4 py-2 text-sm" aria-label="Notification" data-test="notification">
          {{ notification }}
        </div>
      </FwbListGroupItem>
    </FwbListGroup>
  </div>
</template>
