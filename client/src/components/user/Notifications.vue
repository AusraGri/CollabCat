<script setup lang="ts">
import { FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue'

const { hasNotifications = false } = defineProps<{
  hasNotifications?: boolean
}>()
</script>

<template>
  <FwbDropdown align-to-end>
    <template #trigger>
      <span>
        <svg
          class="h-5 w-5"
          :class="{ 'animate-bounce text-red-500': hasNotifications }"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 14 20"
        >
          <path
            d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z"
          />
        </svg>
      </span>
    </template>
    <div class="bg-gray-200">
      <div
        class="block w-full rounded-t-lg bg-gray-200 px-4 py-2 text-center font-medium text-gray-700 dark:bg-gray-800 dark:text-white"
      >
        Notifications
      </div>
      <div>
        <FwbListGroup>
          <slot name="notifications" :active="hasNotifications"> </slot>
          <FwbListGroupItem v-if="!hasNotifications">
            <div class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No new notifications.
            </div>
          </FwbListGroupItem>
        </FwbListGroup>
      </div>
      <div>
        <a
          href="#"
          class="block w-full rounded-b-lg bg-gray-200 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          <div class="inline-flex items-center">
            <svg
              class="me-2 h-4 w-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 14"
            >
              <path
                d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
              />
            </svg>
            View all
          </div>
        </a>
      </div>
    </div>
  </FwbDropdown>
</template>
<style scoped></style>
