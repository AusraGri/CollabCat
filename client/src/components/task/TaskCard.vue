<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue'
import { FwbBadge, FwbCheckbox } from 'flowbite-vue'
import { type TaskData, type CategoriesPublic, type GroupMember, type GroupsPublic } from '@server/shared/types'
import UserBasicProfile from '../user/UserBasicProfile.vue'
import RecurrenceCard from './RecurrenceCard.vue'
import TaskInfo from './TaskInfo.vue'
import { toggle } from '@/utils/helpers'
import { timeToLocalTime, formatDateToLocal } from '@/utils/helpers'
import { useTasksStore } from '@/stores/taskStore'


const emit = defineEmits<{
  (event: 'task:updated', value: TaskData): void
  (event: 'task:deleted', value: number): void
  (event: 'task:status', value: {id: number, isCompleted: boolean, points: number | null, groupId: number|null}): void
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

const toggleTaskInfo = () => {
  toggle(showTaskInfo)
}

function isTaskCompleted (task: TaskData) {
  if(!task.isRecurring && !task.recurrence) return task.isCompleted

  if(task.isRecurring){
    return !!task.completed?.length
  }

}

const updateTask = async (updatedTask: TaskData) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recurrence, completed, id, createdByUserId, ...task } = updatedTask

  const updateTaskData = {
    id,
    task: { ...task },
    recurrence,
  }
  try {
    const [task] = await taskStore.updateTask(updateTaskData)
    emit('task:updated', task)
  } catch (error) {
    console.log(error)
  }
}

const deleteTask = async () => {
  const taskId = props.task.id
  try {
    const result = await taskStore.deleteTask(taskId)

    if (result) {
      emit('task:deleted', taskId)
    }

  } catch (error) {
    console.log(error)
  }

}

const updateTaskStatus = (value: boolean) => {
  const taskData = {
    isCompleted: value,
    id: props.task.id,
    points: props.task.points,
    groupId: props.task.groupId
  }
  emit('task:status', taskData)
}

watch(()=> props.task, (newTask)=>{
 check.value = isTaskCompleted(newTask)
})
</script>

<template>
  <div
    class="m-1 flex h-fit w-fit items-stretch space-x-1 rounded rounded-s-2xl bg-slate-400 p-1"
    aria-label="task item"
  >
    <div v-if="isCheckbox" class="h-6 self-center">
      <FwbCheckbox v-model="check" :disabled="!isCheckboxEnabled" @update:model-value="updateTaskStatus" />
    </div>
    <div
      @click="toggleTaskInfo"
      class="flex h-full min-w-60 cursor-pointer flex-col items-center"
      aria-label="task-info"
    >
      <div class="flex w-full justify-between rounded-t p-1">
        <div class="p-1">{{ task.title }}</div>
      </div>
      <div
      v-if="task.startDate"
        :class="[
          'flex',
          'w-full',
          'justify-between',
          'bg-orange-300',
          'p-1',
          { 'rounded-b': !task.assignedUserId },
        ]"
      >
        <div v-if="task.startDate" class="p-1 text-sm">
          {{ formatDateToLocal(task.startDate) }}
          <span v-if="task.endDate">--> {{ formatDateToLocal(task.endDate) }}</span>
        </div>
        <div v-if="task.startTime && task.startDate">{{ timeToLocalTime(task.startTime, task.startDate) }}</div>
      </div>
      <div v-if="task.recurrence">
        <RecurrenceCard :recurrence="task.recurrence" />
      </div>
      <div v-if="taskCategory" class="text-sm" aria-label="category">
        <span>Category:</span>
        <span>{{ taskCategory?.title }}</span>
      </div>
      <div v-if="taskGroup" class="text-sm" aria-label="category">
        <span>Group:</span>
        <span>{{ taskGroup.name }}</span>
      </div>
      <div v-if="assignedUserProfile" class="flex w-full">
        <UserBasicProfile :user="assignedUserProfile" />
      </div>
    </div>
    <div aria-label="task options">
      <div class="flex h-full w-fit flex-col space-y-1">
        <div class="min-w-10" aria-label="points">
          <FwbBadge size="sm" class="w-full rounded-e-full p-0">{{ task.points }}</FwbBadge>
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
