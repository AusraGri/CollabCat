<script setup lang="ts">
import { computed, ref } from 'vue'
import { FwbBadge, FwbCheckbox, FwbAvatar, FwbButton } from 'flowbite-vue'
import { type TaskData, type CategoriesPublic, type GroupMember } from '@server/shared/types'
import UserBasicProfile from '../user/UserBasicProfile.vue'
import RecurrenceCard from './RecurrenceCard.vue'
import TaskInfo from './TaskInfo.vue'
import { timeToLocalTime, formatDateToLocal } from '@/utils/helpers'

const check = ref(false)
const emit = defineEmits(['update:delete', 'update:done'])

const { task, categories, groupMembers } = defineProps<{
  categories?: CategoriesPublic[]
  task: TaskData
  groupMembers?: GroupMember[]
}>()

const taskCategory = computed(() => {
  if (!categories) return

  return categories.find((category) => category.id === task.categoryId)
})

const assignedUserProfile = computed(()=> {
  if(task.assignedUserId && groupMembers){
return groupMembers.find((member)=> member.id === task.assignedUserId)
  }
  return undefined
})

const isTaskInfo = ref(false)

const toggleTaskInfo = () => {
  isTaskInfo.value = !isTaskInfo.value
}

// function formatDateToLocal(dateString: Date): string {
//   const date = new Date(dateString)
//   const isoString = date.toISOString()

//   const formattedDate = isoString.split('T')[0]

//   return formattedDate
// }

// function taskTimeToLocalTime(timeString: string, timestamptz: Date): string {
//   const date = new Date(timestamptz)

//   const [hours, minutes] = timeString.split(':').map(Number)
//   date.setHours(hours, minutes, 0, 0)

//   const options: Intl.DateTimeFormatOptions = {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: false,
//     timeZoneName: 'short',
//   }

//   const formatter = new Intl.DateTimeFormat(undefined, options)
//   const formattedParts = formatter.formatToParts(date)
//   const formattedTime = formattedParts
//     .filter((part) => part.type === 'hour' || part.type === 'minute')
//     .map((part) => part.value)
//     .join(':')

//   return formattedTime
// }
</script>

<template>
  <div
    class="m-1 flex h-fit w-fit items-stretch space-x-1 rounded rounded-s-2xl bg-slate-400 p-1"
    aria-label="task item"
  >
    <div class="h-6 self-center">
      <FwbCheckbox v-model="check" />
    </div>
    <div
      @click="toggleTaskInfo"
      class="flex h-full min-w-60 cursor-pointer flex-col items-center"
      aria-label="task-info"
    >
      <div class="flex w-full justify-between rounded-t p-1">
        <div class="p-1">{{ task.title }}</div>
        <div class="h-full rounded bg-green-400 p-1">{{ task.importance }}</div>
      </div>
      <div
        :class="[
          'flex',
          'w-full',
          'justify-between',
          'bg-orange-300',
          'p-1',
          { 'rounded-b': !task.assignedUserId },
        ]"
      >
        <div class="p-1 text-sm">
          {{ formatDateToLocal(task.startDate) }}
          <span v-if="task.endDate">--> {{ formatDateToLocal(task.endDate) }}</span>
        </div>
        <div v-if="task.startTime">{{ timeToLocalTime(task.startTime, task.startDate) }}</div>
      </div>
      <div v-if="task.recurrence">
        <RecurrenceCard :recurrence="task.recurrence" />
      </div>
      <div v-if="assignedUserProfile" class="flex w-full">
       <UserBasicProfile :user="assignedUserProfile" />
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
  <TaskInfo
    :is-show-modal="isTaskInfo"
    :categories="categories"
    :group-members="groupMembers"
    :task="task"
    @close="toggleTaskInfo"
  />
</template>
<style scoped></style>
