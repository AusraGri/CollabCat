<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { FwbButton, FwbCheckbox } from 'flowbite-vue'
import RecurrenceForm from './RecurrenceForm.vue'
import { type RecurrencePattern } from '@server/shared/types'
import { areObjectsEqual } from '@/utils/helpers'

const { isShowRecurrence, isRecurring, pickDates } = defineProps<{
  isShowRecurrence: boolean
  isRecurring: boolean
  pickDates: boolean
}>()

const emit = defineEmits<{
  (event: 'closeRecurrence'): void
}>()

const recurrencePattern = defineModel('recurrencePattern', {
  type: [Object, null] as PropType<RecurrencePattern | null>,
})

const recurrence = ref(isRecurring)
const recurrenceOrigin = ref(isRecurring)
const originalRecurrence = ref(recurrencePattern.value)

const current = computed(() => {
  if (!recurrence.value) return null

  return recurrencePattern.value
})
const noChanges = computed(() => {
  return areObjectsEqual(originalRecurrence.value, current.value)
})

// const saveChanges = (newPatternValues: any) => {
//   recurrencePattern.value = {
//     ...recurrencePattern.value,
//     ...newPatternValues,
//   }
// }

const closeRecurrenceModal = () => {
  originalRecurrence.value = current.value
  emit('closeRecurrence')
}

const savePatternChanges = () => {
  recurrencePattern.value = current.value
  originalRecurrence.value = current.value
  recurrenceOrigin.value = recurrence.value
  emit('closeRecurrence')
}

const resetPatternChanges = () => {
  recurrence.value = recurrenceOrigin.value
  if (originalRecurrence.value) {
    recurrencePattern.value = originalRecurrence.value
  }
}
</script>

<template>
  <div class="relative z-[100]" v-if="isShowRecurrence" tabindex="-1">
    <div
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      @click.self.stop="closeRecurrenceModal"
    >
      <div class="m-3 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <header class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Edit Recurrence</h2>
          <button @click.stop="closeRecurrenceModal" class="text-gray-500 hover:text-black">
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
          <FwbCheckbox v-model="recurrence" label="Recurring" />
          <RecurrenceForm
            v-if="recurrence"
            :is-recurring="recurrence"
            :pick-dates="pickDates"
            v-model:recurrence-pattern="recurrencePattern"
          />
        </div>
        <footer class="mt-4 flex justify-between space-x-2">
          <fwb-button v-if="!noChanges" @click.stop="resetPatternChanges" color="yellow">
            Reset Changes
          </fwb-button>
          <fwb-button v-if="!noChanges" @click.stop="savePatternChanges" color="green">
            Save Changes
          </fwb-button>
        </footer>
      </div>
    </div>
  </div>
</template>
