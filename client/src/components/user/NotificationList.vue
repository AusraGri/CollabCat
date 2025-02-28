<script setup lang="ts">
import { FwbListGroupItem, FwbListGroup } from 'flowbite-vue';

defineProps({
  notifications: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <FwbListGroup >
    <FwbListGroupItem v-for="(notification, index) in notifications" :key="index" >
      <div class="px-4 py-2 text-sm w-full min-w-fit" aria-label="Notification" data-test="notification">
        {{ notification }}
      </div>
    </FwbListGroupItem>
  </FwbListGroup>
</template>
