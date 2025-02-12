<script setup lang="ts">
import { FwbAvatar } from 'flowbite-vue'
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'

const props = defineProps({
  taskId: {
    type: Number,
    required: true,
  },
})
const users = ref()

onMounted(async () => {
  users.value = await trpc.user.getAssignedUserByTaskId.query({ taskId: props.taskId })
})
</script>

<template>
  <div v-for="user in users" :key="user.id" class="flex w-full rounded-b bg-orange-100 p-1">
    <FwbAvatar v-if="user.picture" :image="user.picture" rounded size="sm" />
    <div>{{ user.username }}</div>
  </div>
</template>
<style scoped></style>
