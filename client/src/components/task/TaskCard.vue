<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue'
import { FwbBadge, FwbCheckbox } from 'flowbite-vue'
import { UsersIcon, Squares2X2Icon, ClockIcon } from "@heroicons/vue/24/outline";
import {
  type TaskData,
  type CategoriesPublic,
  type GroupMember,
  type GroupsPublic,
} from '@server/shared/types'
import UserBasicProfile from '../user/UserBasicProfile.vue'
import RecurrenceCard from './RecurrenceCard.vue'
import TaskInfo from './TaskInfo.vue'
import { toggle } from '@/utils/helpers'
import { timeToLocalTime, formatDateToLocal } from '@/utils/helpers'
import { useTasksStore } from '@/stores/taskStore'

const emit = defineEmits<{
  (event: 'task:updated', value: TaskData): void
  (event: 'task:deleted', value: number): void
  (
    event: 'task:status',
    value: { id: number; isCompleted: boolean; points: number | null; groupId: number | null }
  ): void
}>()

const taskStore = useTasksStore()

const props = defineProps({
  categories: {
    type: Array as PropType<CategoriesPublic[]>,
    default: () => [],
  },
  groups: {
    type: Array as PropType<GroupsPublic[]>,
    default: () => [],
  },
  task: {
    type: Object as PropType<TaskData>,
    required: true,
  },
  groupMembers: {
    type: Array as PropType<GroupMember[]>,
    default: () => [],
  },
  isCheckbox: {
    type: Boolean,
    default: true,
  },
  isTaskInfo: {
    type: Boolean,
    default: true,
  },
  isCheckboxEnabled: {
    type: Boolean,
    default: true,
  },
  isGroupInfo: {
    type: Boolean,
    default: true,
  },
  isShowDates: {
    type: Boolean,
    default: true,
  },
  isShowRecurrence: {
    type: Boolean,
    default: true
  }
})

const taskCategory = computed(() => {
  if (!props.categories) return

  return props.categories.find((category) => category.id === props.task.categoryId)
})
const taskGroup = computed(() => {
  if (!props.groups) return

  return props.groups.find((group) => group.id === props.task.groupId)
})


const assignedUserProfile = computed(() => {
  if (props.task.assignedUserId && props.groupMembers) {
    return props.groupMembers.find((member) => member.id === props.task.assignedUserId)
  }
  return undefined
})

const showTaskInfo = ref(false)

const check = ref(isTaskCompleted(props.task))

const isCompletedTask = computed(()=> {
  if(check.value && props.isCheckbox ) return true

  if(!props.isCheckbox && props.task.isCompleted) return true

  return false
})


const toggleTaskInfo = () => {
  toggle(showTaskInfo)
}

function isTaskCompleted(task: TaskData) {
  if (!task.isRecurring && !task.recurrence) return task.isCompleted

  if (task.isRecurring) {
    return !!task.completed?.length
  }
}

const updateTask = async (updatedTask: TaskData) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recurrence, completed, id, createdByUserId, ...task } = updatedTask

  const updateTaskData = {
    id,
    task: { ...task },
    recurrence: recurrence || undefined,
  }
  try {
    await taskStore.updateTask(updateTaskData)
  } catch (error) {
    console.log(error)
  }
}

const deleteTask = async () => {
  const taskId = props.task.id
  try {
    await taskStore.deleteTask(taskId)
  } catch (error) {
    console.log(error)
  }
}

const updateTaskStatus = async (value: boolean) => {
  const taskData = {
    isCompleted: value,
    id: props.task.id,
    points: props.task.points,
    groupId: props.task.groupId,
  }
  emit('task:status', taskData)
}

watch(
  () => props.task,
  (newTask) => {
    check.value = isTaskCompleted(newTask)
  }
)
</script>

<template>
  <div
    :class="[
      'border-grey-700 m-1 flex h-fit w-full space-x-1 rounded rounded-s-2xl border-2 p-2 shadow-md',
      isCompletedTask ? 'bg-green-400' : 'bg-gray-400',
    ]"
    aria-label="task item"
  >
    <div v-if="isCheckbox" class="self-center">
      <FwbCheckbox
        v-model="check"
        :disabled="!isCheckboxEnabled"
        @update:model-value="updateTaskStatus"
      />
    </div>
    <div
      @click="toggleTaskInfo"
      class="flex flex-1 min-w-60 cursor-pointer flex-col items-stretch rounded-l-md bg-slate-50"
      aria-label="task-info"
    >
      <div class="flex w-full justify-between rounded-t p-1">
        <div class="p-1">{{ task.title }}</div>
      </div>
      <div
        v-if="task.startDate && isShowDates"
        :class="[
          'flex',
          'w-full',
          'justify-around',
          'items-middle',
          ,
          'p-1',
          { 'justify-between bg-orange-300': isShowDates },
          {' rounded-bl' : !task.recurrence && !task.categoryId && !task.groupId }
        ]"
      >
        <div v-if="task.startDate" class=" text-sm" aria-label="task-dates">
          <span>{{ formatDateToLocal(task.startDate) }}</span>
          <span v-if="task.endDate"> --> {{ formatDateToLocal(task.endDate) }}</span>
        </div>
      </div>

      <div v-if="task.recurrence && isShowRecurrence" class="text-sm p-1 text-center bg-orange-200">
        <RecurrenceCard :recurrence="task.recurrence" />
      </div>
      <div v-if="taskCategory" class="flex items-center space-x-2 text-sm pl-1" aria-label="category">
        <Squares2X2Icon class="w-5 h-5 text-blue-500" />
        <span>{{ taskCategory?.title }}</span>
      </div>
      <div v-if="taskGroup && isGroupInfo" class="flex items-center space-x-2 text-sm pl-1" aria-label="group">
        <UsersIcon class="w-5 h-5 text-blue-500" />
        <span>{{ taskGroup.name }}</span>
      </div>
    </div>
    <div aria-label="task options" class="min-w-14">
      <div class="flex h-full w-fit min-w-10 flex-col justify-between">
        <div class="min-w-10" aria-label="points">
          <FwbBadge size="sm" class="w-fit min-w-10 rounded-e-full p-0">{{ task.points }}</FwbBadge>
        </div>
        <div v-if="assignedUserProfile" class="flex w-full justify-center">
          <UserBasicProfile :user="assignedUserProfile" />
        </div>
        <div v-if="task.startTime && task.startDate" class="flex items-center space-x-1 text-sm">
          <ClockIcon class="w-5 h-5 text-blue-500"/>
          <span class="text-xs tracking-wider">
            {{ timeToLocalTime(task.startTime, task.startDate) }}</span
          >
        </div>
      </div>
    </div>
  </div>
  <div v-if="isTaskInfo">
    <TaskInfo
      :is-show-modal="showTaskInfo"
      :categories="categories"
      :group-members="groupMembers"
      :task="task"
      @update:task="updateTask"
      @delete:task="deleteTask"
      @close="toggleTaskInfo"
    />
  </div>
</template>
<style scoped></style>
