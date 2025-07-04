<script setup lang="ts">
import { computed } from 'vue'
import { type RecurrencePattern } from '@server/shared/types'

const { recurrence } = defineProps<{
  recurrence: RecurrencePattern
}>()

const isDaily = computed(() => recurrence.recurringType === 'daily')
const isWeekly = computed(() => recurrence.recurringType === 'weekly')

const weekdays = computed(() => {
  if (!recurrence.dayOfWeek) {
    return
  }
  return getWeekdayNames(recurrence.dayOfWeek)
})

const separationLabel = computed(() => {
  const type = recurrence.recurringType === 'daily' ? 'day' : 'week'
  const value = String(separation(recurrence.separationCount))
  if (value === '1') {
    return `Every ${type}`
  }
  if (value.endsWith('1') && !value.endsWith('11')) {
    return `Every ${value} ${type}`
  }
  return `Every ${value} ${type}s`
})

function getWeekdayNames(weekdays: number[]) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return weekdays.map((number) => weekDays[number % 7])
}

function separation(count: number) {
  return count + 1
}
</script>
<template>
  <div
    class="text-sm"
    aria-label="Task recurrence pattern info"
    data-test="task-recurrence-pattern-info"
  >
    <div v-if="isDaily">
      <div :aria-label="separationLabel" data-test="task-repeat-daily">{{ separationLabel }}</div>
    </div>
    <div v-if="isWeekly" class="flex flex-col space-y-1 sm:items-center sm:space-x-3 sm:space-y-0">
      <div
        v-if="recurrence.dayOfWeek"
        class="flex space-x-1"
        aria-label="Task repeats on:"
        data-test="task-days-of-week"
      >
        <div
          v-for="day in weekdays"
          :key="day"
          class="w-fit min-w-8 rounded bg-green-500 p-1 text-center text-white"
          :aria-label="`Day of the week: ${day}`"
        >
          {{ day }}
        </div>
      </div>
      <div :aria-label="separationLabel" data-test="task-repeat-weekly">
        {{ separationLabel }}
      </div>
    </div>
  </div>
</template>
