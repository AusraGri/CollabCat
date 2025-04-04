<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue'
import { FwbBadge, FwbCheckbox } from 'flowbite-vue'
import { UsersIcon, Squares2X2Icon, ClockIcon, StarIcon } from '@heroicons/vue/24/outline'
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
import { useTasksStore, useUserStore, useUserGroupsStore } from '@/stores'
import { checkRecurrence } from '@/utils/tasks'

const emit = defineEmits<{
  (event: 'task:updated', value: TaskData): void
  (event: 'task:deleted', value: number): void
  (
    event: 'task:status',
    value: { id: number; isCompleted: boolean; points: number | null; groupId: number | null }
  ): void
}>()

const taskStore = useTasksStore()
const userStore = useUserStore()
const userGroupStore = useUserGroupsStore()

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
    default: true,
  },
})

const isAdmin = computed(() => {
  const userId = userStore.user?.id
  const taskAssigneeId = props.task.assignedUserId
  const taskCreatorId = props.task.createdByUserId
  const isGroupAdmin = userGroupStore.isAdmin

  return isGroupAdmin || userId === taskAssigneeId || userId === taskCreatorId
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

const isCompletedTask = computed(() => {
  if (check.value && props.isCheckbox) return true

  if (!props.isCheckbox && props.task.isCompleted) return true

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

  const checkedRecurrencePattern = checkRecurrence(recurrence)
  const updateTaskData = {
    id,
    task: { ...task },
    recurrence: checkedRecurrencePattern || undefined,
  }

  await taskStore.updateTask(updateTaskData)
}

const deleteTask = async () => {
  const taskId = props.task.id
  await taskStore.deleteTask(taskId)
}

const updateTaskStatus = async (value: boolean) => {
  if (!isAdmin.value) return

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
  <div>
    <div
      :class="[
        'border-grey-700 m-1 flex h-fit w-fit space-x-1 rounded rounded-s-2xl border-2 p-2 shadow-md',
        isCompletedTask ? 'bg-gray-400' : 'bg-green-400',
      ]"
      :aria-label="`${task.title}`"
      :data-test="`${task.title.replace(' ', '-')}`"
    >
      <div v-if="isCheckbox" class="self-center">
        <FwbCheckbox
          v-model="check"
          :disabled="!isCheckboxEnabled || !isAdmin"
          @update:model-value="updateTaskStatus"
          :aria-label="`${task.title} complete status`"
          data-test="task-status"
          :aria-checked="check ? 'true' : 'false'"
        />
      </div>
      <div
        @click="toggleTaskInfo"
        class="flex min-w-60 cursor-pointer flex-col items-stretch rounded-l-md bg-slate-50"
        aria-label="`${task.title} information`"
      >
        <div class="flex w-full justify-between rounded-t p-1">
          <div class="p-1" :aria-label="`${task.title} title`" data-test="task-title">
            {{ task.title }}
          </div>
        </div>
        <div
          v-if="task.startDate && isShowDates"
          :aria-label="`${task.title} dates`"
          data-test="task-dates"
          :class="[
            'flex',
            'w-full',
            'justify-around',
            'items-middle',
            ,
            'p-1',
            { 'justify-between bg-orange-300': isShowDates },
            { ' rounded-bl': !task.recurrence && !task.categoryId && !task.groupId },
          ]"
        >
          <div v-if="task.startDate" class="text-sm">
            <span :aria-label="`${task.title} start date`" data-test="task-start-date">{{
              formatDateToLocal(task.startDate)
            }}</span>
            <span
              v-if="task.endDate"
              :aria-label="`${task.title} end date`"
              data-test="task-end-date"
            >
              --> {{ formatDateToLocal(task.endDate) }}</span
            >
          </div>
        </div>

        <div
          v-if="task.recurrence && isShowRecurrence"
          class="bg-orange-200 p-1 text-center text-sm"
          :aria-label="`${task.title} recurrence`"
          data-test="task-recurrence"
        >
          <RecurrenceCard :recurrence="task.recurrence" />
        </div>
        <div
          v-if="taskCategory"
          class="flex items-center space-x-2 pl-1 text-sm"
          :aria-label="`${task.title} category`"
          data-test="task-category"
        >
          <Squares2X2Icon class="h-5 w-5 text-blue-500" />
          <p>{{ taskCategory?.title }}</p>
        </div>
        <div
          v-if="taskGroup && isGroupInfo"
          class="flex items-center space-x-2 pl-1 text-sm"
          :aria-label="`${task.title} group`"
          data-test="task-group"
        >
          <UsersIcon class="h-5 w-5 text-blue-500" />
          <p>{{ taskGroup.name }}</p>
        </div>
      </div>
      <div aria-label="task options" class="min-w-14">
        <div class="flex h-full w-fit min-w-10 flex-col justify-between">
          <div
            v-if="task.points"
            class="min-w-10"
            :aria-label="`${task.title} points`"
            data-test="task-points"
          >
            <FwbBadge size="sm" type="yellow" class="w-fit min-w-10 rounded-e-full p-0">
              <StarIcon class="h-3 pr-1" />
              {{ task.points }}</FwbBadge
            >
          </div>
          <div
            v-if="assignedUserProfile"
            class="flex w-full justify-center"
            :aria-label="`${task.title} assigned user`"
            data-test="task-assigned-user"
          >
            <UserBasicProfile :user="assignedUserProfile" />
          </div>
          <div
            v-if="task.startTime && task.startDate"
            class="mt-1 flex items-center space-x-1 text-sm"
            :aria-label="`${task.title} time`"
            data-test="task-time"
          >
            <ClockIcon class="h-5 w-5 text-gray-50" />
            <p class="text-xs tracking-wider">
              {{ timeToLocalTime(task.startTime, task.startDate) }}
            </p>
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
  </div>
</template>
<style scoped></style>
