<script setup lang="ts">
import { FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import { BellIcon, EyeIcon } from '@heroicons/vue/24/outline'

const { hasNotifications = false } = defineProps<{
  hasNotifications?: boolean
}>()
</script>

<template>
  <FwbDropdown align-to-end>
    <template #trigger>
      <span>
        <BellIcon
          :class="['w-7', { 'animate-bounce text-red-500': hasNotifications }]"
          role="button"
          tabindex="0"
          aria-label="Notification Bell"
          data-test="notification-bell"
        />
      </span>
    </template>
    <div class="bg-gray-200">
      <div
        class="block w-full rounded-t-lg bg-gray-200 px-4 py-2 text-center font-medium text-gray-700 dark:bg-gray-800 dark:text-white"
        role="heading"
        aria-label="Notifications"
        data-test="notifications"
      >
        Notifications
      </div>
      <div role="region" aria-live="polite" data-test="notification-list">
        <FwbListGroup>
          <slot name="notifications" :active="hasNotifications"> </slot>
          <FwbListGroupItem v-if="!hasNotifications" data-test="no-notifications">
            <div class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No new notifications.
            </div>
          </FwbListGroupItem>
        </FwbListGroup>
      </div>
      <div v-if="hasNotifications">
        <a
          href="#"
          role="button"
          aria-label="View all notifications"
          tabindex="0"
          class="block w-full rounded-b-lg bg-gray-200 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          <div class="inline-flex items-center space-x-2">
            <EyeIcon class="w-5" />
            <span>View all</span>
          </div>
        </a>
      </div>
    </div>
  </FwbDropdown>
</template>
