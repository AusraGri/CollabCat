<script setup lang="ts">
import { FwbAvatar } from 'flowbite-vue'
import { type GroupMember, type UserPublic } from '@server/shared/types'
const { user } = defineProps<{
  user: UserPublic | GroupMember
}>()
</script>

<template>
  <div class="relative mr-1 mt-1 flex items-center whitespace-nowrap">
    <div class="group relative">
      <FwbAvatar
        :img="user.picture ?? undefined"
        rounded
        size="sm"
        class="cursor-pointer"
        tabindex="0"
        aria-describedby="tooltip-username"
        data-test="user-avatar"
      />

      <!-- Tooltip -->
      <div
        id="tooltip-username"
        role="tooltip"
        class="invisible absolute bottom-full left-1/2 z-50 mb-2 ml-2 mr-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1 text-sm font-medium text-white opacity-0 shadow-md transition-all duration-300 group-hover:visible group-hover:opacity-100"
        style="transform: translateX(-50%)"
        data-test="tooltip-username"
      >
        {{ user.username }}
      </div>
    </div>
  </div>
</template>
<style scoped>
.group:hover .group-hover\\:block {
  display: block;
}
</style>
