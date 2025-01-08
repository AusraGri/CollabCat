<script setup lang="ts">
import { onMounted, type PropType } from 'vue'
import { ref, watch, computed } from 'vue'
import { FwbInput, FwbSelect, FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import { type RecurrencePattern } from '@server/shared/types'
import { areObjectsEqual } from '@/utils/helpers'

const { isRecurring, pickDates } = defineProps<{
  isRecurring: boolean
  pickDates: boolean
}>()


const recurrencePattern = defineModel('recurrencePattern', {
  type: [Object, null] as PropType<Partial<RecurrencePattern> | null>,
})
const startDate = defineModel('startDate', { type: [Date, String] as PropType<Date | string> })
const endDate = defineModel('endDate', { type: [Date, String] as PropType<Date | string> })
const recurringType = ref<string>(recurrencePattern.value?.recurringType || 'daily')
const selectedDaysOfWeek = ref<number[]>(recurrencePattern.value?.dayOfWeek || [])
const everyXCount = ref(
  recurrencePattern.value?.separationCount
    ? String(recurrencePattern.value.separationCount + 1)
    : '1'
)

const countLabel = computed(() => {
  const type = recurringType.value === 'daily' ? 'day' : 'week'
  const value = String(everyXCount.value)
  if (value === '1') {
    return `Every ${type}`
  }
  if (value.endsWith('1') && !value.endsWith('11')) {
    return `Every ${value} ${type}`
  }
  return `Every ${value} ${type}s`
})

const isDayChecked = (day: number) => {
  return selectedDaysOfWeek.value.some((selected) => selected === day)
}

const updateValue = (event: Event, day: number) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedDaysOfWeek.value.push(day)
  } else {
    selectedDaysOfWeek.value = selectedDaysOfWeek.value.filter((selected) => selected !== day)
  }
}

const recurrenceTypes = [
  { value: 'daily', name: 'Daily' },
  { value: 'weekly', name: 'Weekly' },
]

const weekdays = [
  { value: 1, name: 'Monday' },
  { value: 2, name: 'Tuesday' },
  { value: 3, name: 'Wednesday' },
  { value: 4, name: 'Thursday' },
  { value: 5, name: 'Friday' },
  { value: 6, name: 'Saturday' },
  { value: 7, name: 'Sunday' },
]

const recurrencePatternNew = computed<Partial<RecurrencePattern>>(() => ({
  recurringType: recurringType.value,
  separationCount: everyXCount.value === '1' ? 0 : Number(everyXCount.value) - 1,
  dayOfWeek:
    selectedDaysOfWeek.value.length && recurringType.value === 'weekly'
      ? selectedDaysOfWeek.value
      : null,
}))

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-CA')
}

const addOneDay = (date: Date) => {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + 1)
  return newDate
}

const endDateMin = computed(() => {
  if (startDate.value && startDate.value instanceof Date) {
    return addOneDay(startDate.value)
  }
  return ''
})

watch(
  () => recurrencePatternNew.value,
  (newPattern) => {
    if(!areObjectsEqual(newPattern, recurrencePattern.value)){
      recurrencePattern.value = newPattern
    }
  },
  { deep: true }
)

watch(
  () => recurrencePattern.value,
  (newValue) => {
    if (newValue) {
      recurringType.value = newValue.recurringType || 'daily'
      selectedDaysOfWeek.value = newValue.dayOfWeek || []
      everyXCount.value = newValue.separationCount ? String(newValue.separationCount + 1) : '1'
    } else {
      recurringType.value = 'daily'
      selectedDaysOfWeek.value = []
      everyXCount.value = '1'
    }
  }
)

watch(
  () => isRecurring,
  () => {
    startDate.value = ''
    endDate.value = ''
    selectedDaysOfWeek.value = []
    everyXCount.value = '1'
    recurringType.value = 'daily'
  }
)

onMounted(() => {
  if (!recurrencePattern.value) {
    recurrencePattern.value = recurrencePatternNew.value
  }
})
</script>

<template>
  <div v-if="isRecurring" class="w-full space-y-3 rounded-lg bg-white">
    <div v-if="pickDates" class="flex flex-col justify-between space-y-1 text-sm">
      <!-- Recurring Start Date -->
      <div class="flex items-center space-x-2">
        <p class="w-10">start:</p>
        <VueDatePicker
          placeholder="Select Task Recurrence Start Date"
          v-model="startDate"
          :enable-time-picker="false"
          :format="formatDate"
          name="Task Start Date"
          auto-apply
          required
        />
      </div>

      <!-- Recurring End Date -->
      <div class="flex items-center space-x-2">
        <p class="w-10">end:</p>
        <VueDatePicker
          v-model="endDate"
          :enable-time-picker="false"
          placeholder="Select Task Recurrence End Date"
          :format="formatDate"
          :min-date="endDateMin"
          name="Task End Date"
          auto-apply
          required
        />
      </div>
    </div>

    <!-- Recurring Type -->
    <div class="flex flex-col">
      <FwbSelect v-model="recurringType" :options="recurrenceTypes" label="Recurring Type" />
    </div>

    <div v-if="recurringType === 'weekly'" class="space-y-4">
      <div class="flex flex-col">
        <FwbDropdown placement="bottom" text="Choose days">
          <FwbListGroup>
            <FwbListGroupItem v-for="day in weekdays" :key="day.value" hover>
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  :value="day.value"
                  :checked="isDayChecked(day.value)"
                  @change.prevent="(event) => updateValue(event, day.value)"
                  class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-900">{{ day.name }}</span>
              </label>
            </FwbListGroupItem>
          </FwbListGroup>
        </FwbDropdown>
      </div>
    </div>
    <div class="flex flex-col">
      <FwbInput v-model="everyXCount" type="number" min="1" :label="countLabel" />
    </div>
  </div>
</template>
<style scoped></style>
