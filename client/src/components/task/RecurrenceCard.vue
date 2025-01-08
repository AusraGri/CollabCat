<script setup lang="ts">
import { computed } from 'vue'
import { type RecurrencePattern } from '@server/shared/types'

const { recurrence} = defineProps<{
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
  <div class="text-sm">
    <div v-if="isDaily">
      <div>{{ separationLabel }}</div>
    </div>
    <div v-if="isWeekly" class="flex sm:space-x-3 flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
      <div v-if="recurrence.dayOfWeek" class="flex space-x-1">
        <div v-for="day in weekdays" :key="day" class="rounded min-w-8 w-fit p-1 bg-green-500 text-white text-center">
          {{ day }}
        </div>
      </div>
      <div>
        {{ separationLabel }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>
