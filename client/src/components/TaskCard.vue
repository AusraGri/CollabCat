<script setup lang="ts">
import { FwbBadge, FwbCheckbox, FwbAvatar, FwbButton } from 'flowbite-vue'
import { ref } from 'vue'
import type { PropType } from 'vue';
import { type TasksDue } from '@server/shared/types';
import AssignedUsers from './AssignedUsers.vue';

const check = ref(false)
const emit = defineEmits(['update:delete', 'update:done'])
const props = defineProps({
  task: {
    type: Object as PropType<TasksDue>,
    required: true
  }
})
</script>

<template>
  <div
    class="flex h-fit w-fit items-stretch space-x-1 rounded rounded-s-2xl bg-gradient-to-r from-gray-700 via-stone-500 to-slate-300 p-5"
    aria-label="task item"
  >
    <div class="h-6 self-center">
      <FwbCheckbox v-model="check" />
    </div>
    <div class="flex h-full min-w-60 flex-col items-center" aria-label="task-info">
      <div class="flex w-full justify-between rounded-t bg-green-600 p-1">
        <div class="p-1">{{ task.title }}</div>
        <div class="h-full rounded bg-green-400 p-1">{{ task.importance }}</div>
      </div>
      <div :class="['flex', 'w-full', 'justify-between', 'bg-orange-300', 'p-1', { 'rounded-b': !task.assignedUserId }]">
        <div class="p-1">date</div>
        <div class="rounded bg-red-400 p-1">days left</div>
      </div>
      <div v-if="task.assignedUserId" class="flex w-full">
        <AssignedUsers :task-id="task.id" />
        <!-- <FwbAvatar image="../assets/illustration.png" rounded size="sm" /> -->
      </div>
    </div>
    <div aria-label="task options">
      <div class="flex h-full w-fit flex-col justify-between">
        <div class=" " aria-label="points">
          <FwbBadge size="sm" class="h-10 w-full rounded-e-full p-0">{{ task.points }}</FwbBadge>
        </div>
        <div class="flex flex-col space-y-1" aria-label="task edit">
          <FwbButton color="red" size="xs" class="rounded-e-full">delete</FwbButton>
          <FwbButton color="yellow" size="xs" class="rounded-e-full">edit</FwbButton>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
