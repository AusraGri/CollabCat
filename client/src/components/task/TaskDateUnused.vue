<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { FwbModal, FwbButton, FwbCheckbox } from 'flowbite-vue'


const { isShowDateModal } = defineProps<{
  isShowDateModal: boolean
  isRecurring: boolean
}>()

const showModal = ref(true)
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
})

const emit = defineEmits<{
  (event: 'closeDate'): void
}>()

const closeDateModal = () => {
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
  const time = taskDateAndTime.value.startTime
  const taskTime = `${time.hours}:${time.minutes}`
  startDate.value = taskDateAndTime.value.startDate
  endDate.value = taskDateAndTime.value.endDate
  startTime.value = isTime.value ? taskTime : null
  console.log('START', startDate.value)
  console.log('END', endDate.value)
  console.log('TIME', startTime.value)
  emit('closeDate')
}

const resetChanges = () => {
  taskDateAndTime.value = {
    startDate: startDate.value,
    endDate: endDate.value,
    startTime: extractTimeParts(startTime.value),
  }
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
    <FwbModal v-if="showModal" @close="closeDateModal">
      <template #body>
        <div class="flex flex-col space-y-3">
          <div class="flex space-x-3 whitespace-nowrap">
            <div>
              <span for="startDate" class="mr-2 w-20 text-sm">Start Date</span>
              <VueDatePicker
                v-model="taskDateAndTime.startDate"
                id="startDate"
                name="Task Date"
                placeholder="Pick task date"
                :format="formatDate"
                auto-apply
                required
                :enable-time-picker="false"
              ></VueDatePicker>
            </div>
            <div v-if="isRecurring">
              <span for="endDate" class="mr-2 w-20 text-sm">End Date</span>
              <VueDatePicker
                v-model="taskDateAndTime.endDate"
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
      </template>
      <template #footer>
        <div class="flex justify-between">
          <fwb-button @click="resetChanges" color="yellow"> Reset Changes </fwb-button>
          <fwb-button @click="saveChanges" color="green"> Save Changes </fwb-button>
        </div>
      </template>
    </FwbModal>
  </div>
</template>

<style scoped></style>
