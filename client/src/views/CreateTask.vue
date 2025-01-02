<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput, FwbTextarea, Fwb } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import type { TasksPublic} from '@server/shared/types'
import CreateTask from '@/components/task/CreateNewTask.vue'

const today = ref(new Date())

const dailyTasks = ref()

const userTaskList = ref([])

const all = ref()

onMounted(async () => {
const [ allTasks] = await Promise.all([
    trpc.tasks.getAllTasks.query()
  ])

  all.value = allTasks
})


const taskForm = ref({
  title: 'New Test Task',
  startDate: '20024-11-26',
  description: 'some description',
})

function getToday() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  async function createTask() {
  if (!taskForm.value.title.trim() && !taskForm.value.startDate ) return
  console.log('trying to create task')
  await trpc.tasks.create.mutate({...taskForm.value})
  const [ allTasks] = await Promise.all([
    trpc.tasks.getAllTasks.query()
  ])

  all.value = allTasks
  taskForm.value.title = ''
  }

// Local state manipulations.
function addTask(task: TasksPublic) {
  userTaskList.value = [...userTaskList.value, task]
}

</script>

<template>
  <CreateTask/>

    <AlertError :message="errorMessage" />

</template>
