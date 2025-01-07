<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { FwbButton, FwbCheckbox } from 'flowbite-vue'
import { start } from 'repl';

const { isShowDateModal } = defineProps<{
  isShowDateModal: boolean
  isRecurring: boolean
}>()

const startDate = defineModel('startDate', { type: [Date, String] as PropType<Date | string> })
const endDate = defineModel('endDate', {
  type: [Date, String, null] as PropType<Date | string | null>,
})
const startTime = defineModel('startTime', { type: [String, null] as PropType<string | null> })
const isTime = ref(startTime.value ? true : false)

const taskDateAndTime = ref({
  startDate: startDate.value,
  endDate: endDate.value,
  startTime: extractTimeParts(startTime.value),
  isTime: isTime.value
})

const hasChanges = computed(()=> {
    const originalValues = {
        startDate: startDate.value,
        endDate: endDate.value,
        startTime: extractTimeParts(startTime.value),
    }

    return (
    originalValues.startDate !== taskDateAndTime.value.startDate ||
    originalValues.endDate !== taskDateAndTime.value.endDate ||
    JSON.stringify(originalValues.startTime) !== JSON.stringify(taskDateAndTime.value.startTime) ||
    isTime.value !== taskDateAndTime.value.isTime
  );
})

const emit = defineEmits<{
  (event: 'closeDate'): void
}>()

const closeDateModal = () => {
  resetChanges()
  emit('closeDate')
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-CA')
}

const addOneDay = (date: Date) => {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + 1)
  return newDate
}

const endDateMin = computed(() => {
  const startDate = taskDateAndTime.value.startDate
  if (startDate && startDate instanceof Date) {
    return addOneDay(startDate)
  }
  return ''
})

const saveChanges = () => {
  if (!startDate.value) {
    return
  }
  const time = taskDateAndTime.value.startTime
  const taskTime = `${time.hours}:${time.minutes}`

  startTime.value = isTime.value ? taskTime : null
  emit('closeDate')
}

const resetChanges = () => {
  startDate.value = taskDateAndTime.value.startDate
  endDate.value = taskDateAndTime.value.endDate
  taskDateAndTime.value.startTime = extractTimeParts(startTime.value)
  isTime.value = startTime.value ? true : false
}

function extractTimeParts(timeString: string | null | undefined): {
  hours: number
  minutes: number
} {
  if (!timeString)
    return {
      hours: new Date().getHours(),
      minutes: new Date().getMinutes(),
    }
  const parts = timeString.split(':')

  const hours = Number(parts[0])
  const minutes = Number(parts[1])

  return { hours, minutes }
}
</script>

<template>
  <div class="z-100" v-if="isShowDateModal">
    <div
      class="fixed inset-0 flex items-center  justify-center bg-black bg-opacity-50"
      @click.self="closeDateModal"
    >
      <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <header class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Edit Date</h2>
          <button @click="closeDateModal" class="text-gray-500 hover:text-black">
            <svg
              class="h-[22px] w-[22px] text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 25 25"
            >
              <path
                stroke="gray"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18 17.94 6M18 18 6.06 6"
              />
            </svg>
          </button>
        </header>
        <div class="mt-4 space-y-3">
          <div class="flex space-x-3">
            <div>
              <label for="startDate" class="block text-sm font-medium">Start Date</label>
              <VueDatePicker
              :clearable="false"
                v-model="startDate"
                id="startDate"
                name="Task Date"
                placeholder="Pick task date"
                :format="formatDate"
                :max-date="taskDateAndTime.endDate"
                auto-apply
                required
                :enable-time-picker="false"
              ></VueDatePicker>
            </div>
            <div v-if="isRecurring">
              <label for="endDate" class="block text-sm font-medium">End Date</label>
              <VueDatePicker
                v-model="endDate"
                id="endDate"
                name="Task Date"
                placeholder="Pick task end date"
                :format="formatDate"
                :min-date="endDateMin"
                auto-apply
                :enable-time-picker="false"
              ></VueDatePicker>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div>
              <FwbCheckbox v-model="isTime" label="Task Time" />
            </div>
            <div v-if="isTime">
              <VueDatePicker v-model="taskDateAndTime.startTime" time-picker auto-apply />
            </div>
          </div>
        </div>
        <footer class="mt-4 flex justify-between space-x-2">
          <fwb-button v-if="hasChanges" @click="resetChanges" color="yellow"> Reset Changes </fwb-button>
          <fwb-button  v-if="hasChanges" @click="saveChanges" color="green"> Save Changes </fwb-button>
        </footer>
      </div>
    </div>
  </div>
</template>
