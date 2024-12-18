<script setup lang="ts">
import { FwbAvatar} from 'flowbite-vue'
import { type UserPublic } from '@server/shared/types'
const { user } = defineProps<{
  user: UserPublic
}>()
</script>

<template>
  <div class="relative mt-1 mr-1 flex items-center whitespace-nowrap">
    <div class="group relative">
      <FwbAvatar :img="user.picture ?? undefined" rounded size="sm" />

      <!-- Tooltip -->
      <div
        class="z-50 invisible absolute bottom-full left-1/2 mb-2 ml-2 mr-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1 text-sm font-medium text-white opacity-0 shadow-md transition-all duration-300 group-hover:visible group-hover:opacity-100"
        style="transform: translateX(-50%)"
      >
        {{ user.username }}
      </div>
    </div>

    <!-- Username -->
    <!-- <span class="ml-1">{{ user.username }}</span> -->
  </div>
</template>
<style scoped>
.group:hover .group-hover\\:block {
  display: block;
}
</style>
