<!-- NotificationList.vue -->
<script setup lang="ts">

defineProps({
  notifications: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div>
    <FwbListGroup>
      <FwbListGroupItem
        v-for="(notification, index) in notifications"
        :key="index"
      >
        <div class="px-4 py-2 text-sm">
          {{ notification }}
        </div>
      </FwbListGroupItem>
    </FwbListGroup>
  </div>
</template>
