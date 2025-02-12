<script setup lang="ts">
import { ref, computed } from 'vue'
import { FwbModal, FwbButton, FwbTextarea, FwbInput, FwbCheckbox } from 'flowbite-vue'
import RecurrenceForm from './RecurrenceForm.vue'
import CategorySelect from '../categories/CategorySelect.vue'
import { useTasksStore } from '@/stores/taskStore'
import {
  type CategoriesPublic,
  type GroupMember,
  type RecurrencePatternInsertable,
} from '@server/shared/types'
import MembersSelection from '../groups/MembersSelection.vue'

const { isShowModal, categories, groupId } = defineProps<{
  isShowModal: boolean
  categories?: CategoriesPublic[]
  groupId?: number
  groupMembers?: GroupMember[]
}>()

const emit = defineEmits<{
  (event: 'task:new', value: any): void
  (event: 'close'): void
}>()

const time = ref({
  hours: new Date().getHours(),
  minutes: new Date().getMinutes(),
})
const tasksStore = useTasksStore()

const selectedCategory = ref<string | undefined>()
const selectedMembers = ref<number[]>([])
const recurringPattern = ref<RecurrencePatternInsertable | undefined>()
const startDate = ref<Date | string>()
const endDate = ref<Date | string>()
const points = ref<string>('')

const taskData = computed(() => {
  if (!taskForm.value.title) {
    return
  }

  const taskTime = `${time.value.hours}:${time.value.minutes}`

  const assignedUserId = selectedMembers.value[0] || undefined

  const newTaskData = {
    title: taskForm.value.title,
    categoryId: selectedCategory.value ? Number(selectedCategory.value) : undefined,
    description: taskForm.value.description ? taskForm.value.description : undefined,
    endDate: endDate.value ? new Date(endDate.value) : undefined,
    startDate: startDate.value ? new Date(startDate.value) : undefined,
    isRecurring: taskForm.value.isRecurring,
    startTime: taskForm.value.isTime ? taskTime : undefined,
    groupId: groupId ? groupId : undefined,
    points: points.value ? Number(points.value) : undefined,
    assignedUserId: assignedUserId,
  }

  return newTaskData
})

const taskForm = ref({
  title: '',
  description: '',
  isRecurring: false,
  isTime: false,
  isPoints: false,
})

function closeModal() {
  taskForm.value.isRecurring = false
  emit('close')
}

async function confirmAction(confirmed: boolean) {
  if (!confirmed) {
    resetForm()
    emit('close')
    return
  }
  try {
    if (!taskData.value) return

    if (taskData.value.isRecurring && !recurringPattern.value) return

    const newTaskData = {
      task: taskData.value,
      recurrence: recurringPattern.value || undefined,
    }
    const newTask = await tasksStore.createTask(newTaskData)
    resetForm()
    emit('task:new', newTask)
  } catch (error) {
    console.log('Error while saving task', error)
  }
  resetForm()
  emit('close')
}

const format = (date: Date) => {
  return date.toLocaleDateString('en-CA')
}

const resetForm = () => {
  recurringPattern.value = undefined
  selectedMembers.value = []
  startDate.value = undefined
  endDate.value = undefined
  points.value = ''
  taskForm.value = {
    title: '',
    description: '',
    isRecurring: false,
    isTime: false,
    isPoints: false,
  }
}
</script>

<template>
  <FwbModal v-if="isShowModal" @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg">New task</div>
    </template>
    <template #body>
      <form @submit.prevent class="flex flex-col space-y-3">
        <!-- Title Input -->
        <div class="flex flex-col">
          <FwbInput
            v-model="taskForm.title"
            type="text"
            label="Task Title"
            placeholder="Enter task title"
            maxlength="40"
            required
          />
        </div>

        <!-- Description Input -->
        <div class="flex flex-col">
          <FwbTextarea
            v-model="taskForm.description"
            :rows="1"
            label="Description"
            placeholder="Enter task description"
            maxlength="150"
          />
        </div>

        <!-- Recurring Checkbox -->
        <div class="flex items-center">
          <FwbCheckbox v-model="taskForm.isRecurring" label="Recurring" />
        </div>
        <div>
          <RecurrenceForm
            :is-recurring="taskForm.isRecurring"
            :pick-dates="true"
            v-model:recurrence-pattern="recurringPattern"
            v-model:start-date="startDate"
            v-model:end-date="endDate"
          />
        </div>
        <!-- Date and Time Input -->
        <div v-if="!taskForm.isRecurring" class="flex flex-col">
          <div class="flex items-center whitespace-nowrap">
            <label for="dueDate" class="mr-2 w-20 text-sm">Task Date</label>
            <VueDatePicker
              v-model="startDate"
              id="dueDate"
              name="Task Date"
              placeholder="Pick task date"
              :format="format"
              :min-date="new Date()"
              auto-apply
              :enable-time-picker="false"
            ></VueDatePicker>
          </div>
        </div>
        <div v-if="categories">
          <CategorySelect
            v-model:selected-category="selectedCategory"
            :categories="categories"
            :label="'Select Category'"
          />
        </div>
        <div v-if="groupMembers" class="flex items-center space-x-3">
          <span class="text-sm">Assign To:</span>
          <MembersSelection
            :selected-members="selectedMembers"
            :group-members="groupMembers"
            :max-selections="1"
          />
        </div>
        <div class="flex h-11 items-center space-x-3 whitespace-nowrap">
          <div>
            <FwbCheckbox v-model="taskForm.isTime" label="Tasks Time" />
          </div>
          <div v-if="taskForm.isTime" class="grow">
            <VueDatePicker v-model="time" time-picker auto-apply />
          </div>
        </div>
        <div class="flex h-11 items-center space-x-3 whitespace-nowrap">
          <div>
            <FwbCheckbox v-model="taskForm.isPoints" label="Task Points" />
          </div>
          <div v-if="taskForm.isPoints" class="grow">
            <FwbInput v-model="points" type="number" placeholder="Enter point amount" min="1" />
          </div>
        </div>
      </form>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="confirmAction(false)" color="alternative"> Decline </fwb-button>
        <fwb-button @click="confirmAction(true)" color="green"> Add Task </fwb-button>
      </div>
    </template>
  </FwbModal>
</template>
