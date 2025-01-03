<script setup lang="ts">
import {computed} from 'vue'
import { FwbBadge, FwbCheckbox, FwbAvatar, FwbButton } from 'flowbite-vue'
import { ref } from 'vue'
import type { PropType } from 'vue';
import { type TaskData, type CategoriesPublic , type GroupMember} from '@server/shared/types';
import AssignedUsers from './AssignedUsers.vue';
import RecurrenceCard from './RecurrenceCard.vue';

const check = ref(false)
const emit = defineEmits(['update:delete', 'update:done'])

const { task, categories, groupMembers } = defineProps<{
  categories?: CategoriesPublic[]
  task: TaskData
  groupMembers?: GroupMember[]
}>()

const taskCategory = computed(()=>{
  if(!categories) return

  return categories.find(category => category.id === task.categoryId)
})

function formatDateToLocal(dateString: Date): string {
  const date = new Date(dateString);
  const isoString = date.toISOString();

  const formattedDate = isoString.split('T')[0];

  return formattedDate;
}


</script>

<template>
  <div
    class="flex h-fit w-fit items-stretch space-x-1 rounded rounded-s-2xl bg-gradient-to-r from-gray-400 via-stone-200 to-red-200 p-1 m-1"
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
        <div class="p-1 text-sm">{{ formatDateToLocal(task.startDate) }}
          <span v-if="task.endDate">--> {{ formatDateToLocal(task.endDate) }}</span>
        </div>
      </div>
      <div v-if="task.recurrence">
        <RecurrenceCard :recurrence="task.recurrence"/>
      </div>
      <div v-if="task.assignedUserId" class="flex w-full">
        <AssignedUsers :task-id="task.id" />
        <!-- <FwbAvatar image="../assets/illustration.png" rounded size="sm" /> -->
      </div>
    </div>
    <div aria-label="task options">
      <div class="flex h-full w-fit flex-col space-y-1">
        <div class=" " aria-label="points">
          <FwbBadge size="sm" class="w-full rounded-e-full p-0">{{ task.points }}</FwbBadge>
        </div>
        <div v-if="taskCategory" class=" " aria-label="category">
          <FwbBadge size="sm" class="w-full rounded-e-full p-0">{{ taskCategory?.title }}</FwbBadge>
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
