<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { FwbButton, FwbSelect } from 'flowbite-vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { useTasksStore, useUserGroupsStore, usePointsStore } from '@/stores'
import TaskCard from '@/components/task/TaskCard.vue'
import moment from 'moment'
import { type TaskData } from '@server/shared/types'
import { useRoute } from 'vue-router'
import { trpc } from '@/trpc'

const route = useRoute()
const userGroupStore = useUserGroupsStore()
const taskStore = useTasksStore()
const pointsStore = usePointsStore()
const isLoading = ref(true)
const tasksFor = ref('all')
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

const isCheckboxEnabled = computed(() => {
  const today = new Date()

  return today >= date.value
})

const todayDate = () => {
  date.value = new Date()
}

const formatDate = (date: Date) => {
  const today = moment().format('YYYY Do MMMM')

  const formattedDate = moment(date).format('YYYY Do MMMM')

  if (today === formattedDate) return `Today ${formattedDate}`

  return formattedDate
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
    if (points && isCompleted) {
      const isPointsEnabled = pointsStore.isPointsEnabled

      if (isPointsEnabled) {
        const isClaimed = await trpc.points.isUserClaimedPoints.query({
          taskId: id,
          taskInstanceDate: date.value,
        })

        if (isClaimed) return

        if (!isClaimed) {
          pointsStore.alterPoints('+', points)
          await trpc.points.addClaimedPoints.mutate({ taskId: id, taskInstanceDate: date.value })
        }
      }
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
  <div v-if="!isLoading">
    <div
      v-if="isGroupTasks"
      class="mx-auto flex min-w-20 items-center space-x-2 whitespace-nowrap text-sm"
    >
      <span> Show Tasks for:</span>
      <FwbSelect v-model="tasksFor" :options="memberOptions" class="whitespace-nowrap" />
    </div>
    <div
      v-if="!isGroupTasks"
      class="mx-auto flex min-w-20 items-center space-x-2 whitespace-nowrap text-sm"
    >
      <span> Show Tasks for:</span>
      <FwbSelect v-model="tasksFor" :options="personalOptions" class="whitespace-nowrap" />
    </div>
    <div class="mx-auto flex max-w-screen-md flex-col justify-between p-3 sm:flex-row">
      <div class="mr-7 mt-5 flex grow flex-col sm:mt-0 sm:max-w-80">
        <div class="w-full border-b-2 text-center">{{ formatDate(date) }}</div>
        <div v-if="tasks">
          <div v-for="task in tasks" :key="task.id">
            <TaskCard
              :task="task"
              :groups="userGroups"
              :is-task-info="false"
              :is-checkbox-enabled="isCheckboxEnabled"
              @task:status="handleTaskStatusChange"
            />
          </div>
        </div>
        <div v-if="!tasks.length" class="p-3 text-center">No tasks for this day</div>
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
        />
        <div>
          <FwbButton class="w-full" @click="todayDate">Today</FwbButton>
        </div>
      </div>
    </div>
  </div>
</template>
