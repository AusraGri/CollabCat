<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { FwbButton, FwbSelect } from 'flowbite-vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { useTasksStore, useUserGroupsStore, usePointsStore, useCategoriesStore } from '@/stores'
import TaskCard from '@/components/task/TaskCard.vue'
import { formatDateToLongString } from '@/utils/helpers'
import { type TaskData } from '@server/shared/types'
import { useRoute } from 'vue-router'
import { sortTasks } from '@/utils/tasks'

const route = useRoute()
const userGroupStore = useUserGroupsStore()
const categoryStore = useCategoriesStore()
const taskStore = useTasksStore()
const pointsStore = usePointsStore()
const isLoading = ref(true)
const tasksFor = ref('all')
const groupMembers = computed(() => userGroupStore.groupMembers || undefined)
const categories = computed(() =>
  categoryStore.categories.length ? categoryStore.categories : undefined
)
const memberOptions = computed(() => {
  const options =
    userGroupStore.groupMembers?.map((member) => ({
      value: String(member.id),
      name: member.username ? member.username : 'no',
    })) || []

  return [{ value: 'all', name: 'All Members' }, ...options]
})

const personalOptions = ref([
  { value: 'all', name: 'All Groups' },
  { value: 'personal', name: 'My Personal' },
])

const isGroupTasks = computed(() => route.meta.group || false)
const groupId = computed(() => userGroupStore.activeGroup?.id)
const userGroups = computed(() => userGroupStore.userGroups || undefined)
const date = ref(new Date())
const startDate = ref(new Date())
const tasks = ref<TaskData[]>([])
const computedTasks = computed(() => {
  const sortedTasks = sortTasks(taskStore.tasks)
  return sortedTasks
})

const isCheckboxEnabled = computed(() => {
  const today = new Date()

  return today >= date.value
})

const todayDate = () => {
  date.value = new Date()
}

const formatDate = (date: Date) => {
  const todayFormatted = formatDateToLongString(new Date())
  const dateFormatted = formatDateToLongString(date)

  return todayFormatted === dateFormatted ? `Today ${dateFormatted}` : dateFormatted
}

async function fetchDueTasks(date: Date) {
  if (isGroupTasks.value) {
    if (!groupId.value) return
    const userId = tasksFor.value === 'all' ? undefined : Number(tasksFor.value)
    tasks.value = await taskStore.getDueGroupTasks(date, groupId.value, userId)
    return
  }
  const noGroup = tasksFor.value === 'all' ? false : true
  tasks.value = noGroup
    ? await taskStore.getDuePersonalTasks(date, noGroup)
    : await taskStore.getDueTasks(date)
}

const handleTaskStatusChange = async (taskData: {
  id: number
  isCompleted: boolean
  points: number | null
  groupId: number | null
}) => {
  const { id, isCompleted, points } = taskData
  const taskCompletionData = {
    id,
    isCompleted,
    instanceDate: date.value,
  }

  try {
    await taskStore.updateTaskCompletion(taskCompletionData)
    await fetchDueTasks(date.value)
    if (points && isCompleted) {
      await pointsStore.claimPoints({ taskId: id, taskInstanceDate: date.value, points })
    }
  } catch (error) {
    console.log('Failed to update task status', error)
  }
}

watch(
  () => route.path,
  () => {
    date.value = new Date()
  }
)

watch(
  () => date.value,
  async (newDate) => {
    await fetchDueTasks(newDate)
  }
)
watch(
  () => tasksFor.value,
  async () => {
    await fetchDueTasks(date.value)
  }
)

onMounted(async () => {
  await fetchDueTasks(date.value)
  isLoading.value = false
})

watch(
  () => groupId.value,
  async () => {
    await fetchDueTasks(date.value)
  }
)
</script>

<template>
  <div v-if="!isLoading" :aria-busy="isLoading">
    <div class="mx-auto flex max-w-screen-lg justify-center p-3 sm:justify-start">
      <div
        v-if="isGroupTasks"
        class="flex min-w-20 items-center space-x-2 whitespace-nowrap text-sm"
      >
        <label for="tasks-for-group-select" class="text-sm">Show Tasks for:</label>
        <FwbSelect
          id="tasks-for-group-select"
          v-model="tasksFor"
          :options="memberOptions"
          class="whitespace-nowrap"
          aria-label="Select member for tasks"
          data-test="select-member"
        />
      </div>
      <div
        v-if="!isGroupTasks"
        class="flex min-w-20 items-center space-x-2 whitespace-nowrap text-sm"
      >
        <label for="tasks-for-select" class="text-sm">Show Tasks for:</label>
        <FwbSelect
          id="tasks-for-select"
          v-model="tasksFor"
          :options="personalOptions"
          class="whitespace-nowrap"
          aria-label="Select personal tasks"
          data-test="select-personal"
        />
      </div>
    </div>
    <div class="mx-auto flex max-w-screen-lg flex-col justify-between p-3 sm:flex-row">
      <div class="mr-7 mt-5 flex grow flex-col sm:mt-0 sm:max-w-fit">
        <div class="w-full border-b-2 text-center">{{ formatDate(date) }}</div>
        <div v-if="tasks">
          <div v-for="task in computedTasks" :key="task.id" :aria-live="'polite'">
            <TaskCard
              :task="task"
              :group-members="groupMembers"
              :groups="userGroups"
              :categories="categories"
              :is-task-info="false"
              :is-group-info="!isGroupTasks"
              :is-show-dates="false"
              :is-show-recurrence="false"
              :is-checkbox-enabled="isCheckboxEnabled"
              @task:status="handleTaskStatusChange"
              data-test="task-card"
            />
          </div>
        </div>
        <div v-if="!tasks.length" class="p-3 text-center" role="alert" aria-live="assertive">
          No tasks for this day
        </div>
      </div>
      <div class="order-first mx-auto max-w-fit sm:order-last">
        <VueDatePicker
          v-model="date"
          :six-weeks="true"
          inline
          auto-apply
          :start-date="startDate"
          focus-start-date
          :enable-time-picker="false"
          month-name-format="long"
          data-test="date-picker"
          aria-label="Select date"
        />
        <div>
          <FwbButton
            class="w-full"
            @click="todayDate"
            data-test="today-button"
            aria-label="Go to today's date"
            >Today</FwbButton
          >
        </div>
      </div>
    </div>
  </div>
  <div v-else aria-live="assertive" role="status" class="p-3">Loading...</div>
</template>
