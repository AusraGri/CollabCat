<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { useTasksStore, useUserGroupsStore } from '@/stores'
import TaskCard from '@/components/task/TaskCard.vue'
import moment from 'moment'
import type { TaskData } from '@server/shared/types'
import { useRoute } from 'vue-router'

const route = useRoute()
const userGroupStore = useUserGroupsStore()
const taskStore = useTasksStore()

const isGroupTasks = computed(() => route.meta.group)
const groupId = computed(() => userGroupStore.activeGroup?.id)
const date = ref(new Date())
const startDate = ref(new Date())
const tasks = ref<TaskData[]>([])

const formatDate = (date: Date) => {
  const today = moment().format('YYYY Do MMMM')

  const formattedDate = moment(date).format('YYYY Do MMMM')

  if (today === formattedDate) return `Today ${formattedDate}`

  return formattedDate
}

watch(
  () => date.value,
  async (newDate: Date) => {
    console.log(isGroupTasks.value)
    if (isGroupTasks.value && groupId.value) {
      tasks.value = await taskStore.getDueGroupTasks(newDate.toString(), groupId.value)
      return
    }
    tasks.value = await taskStore.getDuePersonalTasks(newDate.toString())
  }
)

onMounted(() => {})
</script>

<template>
  <div class="mx-auto flex max-w-screen-md flex-col justify-between p-3 sm:flex-row">
    <div class="mr-7 mt-5 flex grow flex-col sm:mt-0 sm:max-w-80">
      <div class="w-full border-b-2 text-center">{{ formatDate(date) }}</div>
      <div v-if="tasks">
        <div v-for="task in tasks" :key="task.id">
          <TaskCard :task="task" />
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
    </div>
  </div>
</template>
