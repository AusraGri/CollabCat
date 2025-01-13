<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { FwbButton } from 'flowbite-vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { useTasksStore, useUserGroupsStore } from '@/stores'
import TaskCard from '@/components/task/TaskCard.vue'
import moment from 'moment'
import type { TaskData } from '@server/shared/types'
import { useRoute } from 'vue-router'

const route = useRoute()
const userGroupStore = useUserGroupsStore()
const taskStore = useTasksStore()

const isGroupTasks = computed(() => route.meta.group || false)
const groupId = computed(() => userGroupStore.activeGroup?.id)
const date = ref(new Date())
const startDate = ref(new Date())
const tasks = ref<TaskData[]>([])
const isCheckboxEnabled = computed(()=> {
  const today = new Date()

  return  today >= date.value
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

async function fetchDueTasks (date: Date) {
  if (isGroupTasks.value) {
      if(!groupId.value) return
      tasks.value = await taskStore.getDueGroupTasks(date.toString(), groupId.value)
      return
    }
    tasks.value = await taskStore.getDuePersonalTasks(date.toString())
  }

const handleTaskStatusChange = async(taskData: {id: number, isCompleted: boolean, points: number | null}) => {

  const {id, isCompleted, points} = taskData
  const taskCompletionData = {
    id,
    isCompleted,
    instanceDate: date.value
  }

  try {
    await taskStore.updateTaskCompletion(taskCompletionData)
    if(points){
      console.log('task points', points)
    }
  } catch (error) {
    console.log(error)
  }

}

watch(()=> route.path, () => {
  date.value = new Date()
})

watch(
  () => date.value,
  async (newDate) => {

  await fetchDueTasks(newDate)
  }
)

onMounted(async () => {

await fetchDueTasks(date.value)

})
</script>

<template>
  <div v-for="task in tasks" :key="task.id">
    <br>
    {{ task }}
    <br>
    <span> Completion: {{ task.completed }}</span>
  </div>
  <!-- <div>{{ isCheckboxEnabled }}</div> -->
  <div class="mx-auto flex max-w-screen-md flex-col justify-between p-3 sm:flex-row">
    <div class="mr-7 mt-5 flex grow flex-col sm:mt-0 sm:max-w-80">
      <div class="w-full border-b-2 text-center">{{ formatDate(date) }}</div>
      <div v-if="tasks">
        <div v-for="task in tasks" :key="task.id">
          <TaskCard
            :task="task"
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
</template>
