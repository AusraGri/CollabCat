<script setup lang="ts">
import { ref, computed, type UnwrapRef } from 'vue'
import { FwbModal, FwbButton, FwbTextarea, FwbInput, FwbCheckbox, FwbAlert } from 'flowbite-vue'
import RecurrenceForm from './RecurrenceForm.vue'
import CategorySelect from '../categories/CategorySelect.vue'
import { useTasksStore } from '@/stores/taskStore'
import {
  type CategoriesPublic,
  type GroupMember,
  type RecurrencePatternInsertable,
  type TaskData,
} from '@server/shared/types'
import MembersSelection from '../groups/MembersSelection.vue'
import { checkRecurrence } from '@/utils/tasks'
import { useKeyboardAction } from '@/composables/useKeyboardAction'

type TaskDataType = UnwrapRef<typeof taskData>
type NewTaskData = {
  task: TaskDataType
  recurrence: RecurrencePatternInsertable | undefined
}

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
const errorMessage = ref('')
const selectedCategory = ref<string | undefined>()
const selectedMembers = ref<number[]>([])
const recurringPattern = ref<RecurrencePatternInsertable | undefined>()
const startDate = ref<Date | string>()
const endDate = ref<Date | string>()
const points = ref<string>('')

const checkIfTaskTitleExists = (title: string) => {
  const taskTitle = tasksStore.tasks.find((task)=> task.title.toLowerCase() === title.toLowerCase())

  return !!taskTitle
}

const taskData = computed(() => {
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
  errorMessage.value =''
  taskForm.value.isRecurring = false
  resetForm()
  emit('close')
}

const validateNewTaskData = (taskData: NewTaskData) => {
  const { task, recurrence } = taskData
  if (!task) return false

  if (!task.title) return false

  if (task.isRecurring) {
    if (!recurrence) throw new Error('Missing recurrence data')
    if (!task.startDate) throw new Error('Missing recurring task start date')
  }

  const titleExists = checkIfTaskTitleExists(task.title)

  if(titleExists) throw new Error('Task title already exists. Please choose different')

  return true
}

async function confirmAction(confirmed: boolean) {
  errorMessage.value =''

  if (!confirmed) {
    resetForm()
    emit('close')
    return
  }

  const recurrence = checkRecurrence(recurringPattern.value as TaskData['recurrence'])

  const newTaskData = {
    task: taskData.value,
    recurrence: recurrence || undefined,
  }
   try {
     const isValidTaskData = validateNewTaskData(newTaskData)
     if (!isValidTaskData) return
   } catch (error) {
    if(error instanceof Error){
      errorMessage.value = error.message
      return
    }
   }


  const newTask = await tasksStore.createTask(newTaskData)
  resetForm()
  emit('task:new', newTask)
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

useKeyboardAction(
  () => confirmAction(true),
  () => confirmAction(false),
  () => taskForm.value.title.length >= 3
)
</script>
<template>
  <FwbModal v-if="isShowModal" @close="closeModal" >
    <template #header>
      <div class="inline-flex space-x-3">
        <div class="flex items-center text-lg" data-test="new-task-modal-title">New Task</div>
        <FwbAlert icon type="danger" v-if="errorMessage">{{ errorMessage }}</FwbAlert>
      </div>
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
            aria-label="Task Title Input"
            data-test="task-title-input"
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
            aria-label="Task Description Input"
            data-test="task-description-input"
          />
        </div>

        <!-- Recurring Checkbox -->
        <div class="flex items-center">
          <FwbCheckbox
            v-model="taskForm.isRecurring"
            label="Recurring"
            aria-label="Recurring Task Checkbox"
            data-test="recurring-checkbox"
          />
          <span id="recurrence-info" class="pl-3 text-xs text-gray-500">
            Select the recurrence pattern for this task (e.g., daily, weekly).
          </span>
        </div>
        <div>
          <RecurrenceForm
            :is-recurring="taskForm.isRecurring"
            :pick-dates="true"
            v-model:recurrence-pattern="recurringPattern"
            v-model:start-date="startDate"
            v-model:end-date="endDate"
            aria-describedby="recurrence-info"
            data-test="recurrence-form"
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
              aria-label="Select task due date"
              data-test="task-date-picker"
            ></VueDatePicker>
          </div>
        </div>
        <div v-if="startDate" class="flex h-11 items-center space-x-3 whitespace-nowrap">
          <div>
            <FwbCheckbox
              v-model="taskForm.isTime"
              label="Tasks Time"
              aria-label="Task Time Checkbox"
              data-test="task-time-checkbox"
            />
          </div>
          <div v-if="taskForm.isTime" class="grow">
            <VueDatePicker
              v-model="time"
              time-picker
              auto-apply
              data-test="task-time-picker"
              aria-label="Task Time Picker"
            />
          </div>
        </div>
        <div v-if="categories">
          <CategorySelect
            v-model:selected-category="selectedCategory"
            :categories="categories"
            :label="'Select Category'"
            aria-label="Category Selection"
            data-test="category-select"
          />
        </div>
        <div v-if="groupMembers && groupId" class="flex items-center space-x-3">
          <span class="text-sm">Assign To:</span>
          <MembersSelection
            :selected-members="selectedMembers"
            :group-members="groupMembers"
            :max-selections="1"
            aria-label="Assign task members"
            data-test="members-selection"
          />
        </div>

        <div class="flex h-11 items-center space-x-3 whitespace-nowrap">
          <div>
            <FwbCheckbox
              v-model="taskForm.isPoints"
              label="Task Points"
              aria-label="Task Points Checkbox"
              data-test="task-points-checkbox"
            />
          </div>
          <div v-if="taskForm.isPoints" class="grow">
            <FwbInput
              v-model="points"
              type="number"
              placeholder="Enter point amount"
              min="1"
              aria-label="Points Input"
              data-test="points-input"
            />
          </div>
        </div>
      </form>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <FwbButton
          @click="confirmAction(false)"
          color="alternative"
          aria-label="Decline"
          data-test="decline-button"
        >
          Decline
        </FwbButton>
        <FwbButton
          @click="confirmAction(true)"
          color="green"
          type="submit"
          aria-label="Submit Task"
          data-test="add-task-button"
          :disabled="taskForm.title.length < 3"
        >
          Add Task
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>
