<script setup lang="ts">
import { ref, computed } from 'vue'
import { FwbModal, FwbButton, FwbTextarea, FwbInput, FwbCheckbox, FwbSelect } from 'flowbite-vue'
import RecurrenceForm from './RecurrenceForm.vue'
import CategorySelect from '../categories/CategorySelect.vue'
import { type RecurrencePattern, type CategoriesPublic, type GroupMember } from '@server/shared/types'

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

const selectedCategory = ref<string | undefined>()
const recurringPattern = ref()
const startDate = ref<Date | string >('')
const endDate = ref<Date | string>('')

const taskData = computed(()=>({
    assignedUserId: null,
    categoryId: selectedCategory.value && !isNaN(Number(selectedCategory.value)) ? Number(selectedCategory.value) : null,
    description: taskForm.value.description || null,
    endDate: endDate.value ? endDate.value : null,
    startDate: startDate.value ? startDate.value : null,
    isRecurring: taskForm.value.isRecurring,
    startTime: time.value,
    groupId: groupId ? groupId : null

}))

const taskForm = ref({
  title: '',
  description: '',
  isRecurring: false,
  isTime: false,
})

function closeModal() {
  taskForm.value.isRecurring = false
  emit('close')
}

function handleRecurringPatternUpdate(newPattern: any) {
  recurringPattern.value = newPattern
}

function confirmAction(confirmed: boolean) {
  if (!confirmed) {
    emit('close')
  }
  emit('close')
  console.log('task pattern:', recurringPattern.value)
  console.log('task info:', taskData.value)

}

const format = (date: Date) => {
  return date.toLocaleDateString('en-CA')
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
          />
        </div>

        <!-- Recurring Checkbox -->
        <div class="flex items-center">
          <FwbCheckbox v-model="taskForm.isRecurring" label="Recurring" />
        </div>
        <div>
          <RecurrenceForm
            :is-recurring="taskForm.isRecurring"
            @recurrence:new="handleRecurringPatternUpdate"
            v-model:start-date="startDate"
            v-model:end-date="endDate"
          />
        </div>
        <!-- Date and Time Input -->
        <div v-if="!taskForm.isRecurring" class="flex flex-col">
          <div class="flex items-center">
            <label for="dueDate" class="mr-2 w-20 text-sm">Task Date</label>
            <VueDatePicker
              v-model="startDate"
              id="dueDate"
              name="Task Date"
              placeholder="Pick task date"
              :format="format"
              :min-date="new Date()"
              auto-apply
              required
              :enable-time-picker="false"
            ></VueDatePicker>
          </div>
        </div>
        <div v-if="categories">
            <CategorySelect v-model:selected-category="selectedCategory" :categories="categories" />
        </div>
        <div class="flex h-11 items-center space-x-3">
          <div>
            <FwbCheckbox v-model="taskForm.isTime" label="Tasks Time" />
          </div>
          <div v-if="taskForm.isTime" class="grow">
            <VueDatePicker v-model="time" time-picker auto-apply />
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
