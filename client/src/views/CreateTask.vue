<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput, FwbTextarea, Fwb } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import type { TasksPublic} from '@server/shared/types'

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
  <form aria-label="Article" @submit.prevent="createTask">
    <div class="space-y-6">
      <FwbHeading tag="h1" class="text-3xl">Create a new Task</FwbHeading>

      <div class="mt-6">
        <FwbInput
          aria-label="Task title"
          v-model="taskForm.title"
          :minlength="2"
          label="Task title"
          placeholder="My task description"
        />
      </div>
      <div class="mt-6">
        <FwbInput
          aria-label="Task description"
          v-model="taskForm.description"
          :minlength="2"
          label="Task description"
          placeholder="My task"
        />
      </div>

      <div class="mt-6">
        Task start date
        <input
          aria-label="Task date"
          label="task date"
          type="date"
          id="start"
          v-model="taskForm.startDay"
          name="trip-start"
          :min = "getToday()"
        />
      </div>
      <div class="mt-6">
        Task end date
        <input
          aria-label="Task date"
          label="task date"
          type="date"
          id="start"
          v-model="taskForm.endDay"
          name="trip-start"
          :min = "getToday()"
        />
      </div>
    </div>

    <AlertError :message="errorMessage" />

    <div class="mt-6 flex justify-end">
      <FwbButton size="lg" type="submit">Post Task</FwbButton>
    </div>
    <div>
      <div>{{ all }}</div>
      <div v-if="userTaskList">
        <div v-for="task in userTaskList" :key="task.id"><div>----</div>{{ task }}</div>
      </div>
    </div>
  </form>
</template>
