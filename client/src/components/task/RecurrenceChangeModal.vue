<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { FwbButton, FwbCheckbox } from 'flowbite-vue'
import RecurrenceForm from './RecurrenceForm.vue'
import { type RecurrencePattern, type TaskData } from '@server/shared/types'
import { areObjectsEqual } from '@/utils/helpers'
import { checkRecurrence } from '../../utils/tasks';

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

const isRecurrence = ref(isRecurring)
const isRecurrenceOrigin = ref(isRecurring)
const originalRecurrence = ref(recurrencePattern.value)

const current = computed(() => {
  if (!isRecurrence.value) return null

  return recurrencePattern.value
})
const noChanges = computed(() => {
  return areObjectsEqual(originalRecurrence.value, current.value)
})

const closeRecurrenceModal = () => {
  originalRecurrence.value = current.value
  emit('closeRecurrence')
}

const savePatternChanges = () => {
  const recurrence = current.value as TaskData['recurrence']
  recurrencePattern.value = checkRecurrence(recurrence)
  originalRecurrence.value = checkRecurrence(recurrence)
  isRecurrenceOrigin.value = isRecurrence.value
  emit('closeRecurrence')
}

const resetPatternChanges = () => {
  isRecurrence.value = isRecurrenceOrigin.value
  if (originalRecurrence.value) {
    recurrencePattern.value = originalRecurrence.value
  }
}
</script>

<template>
  <div
    class="relative z-[100]"
    v-if="isShowRecurrence"
    tabindex="-1"
    role="dialog"
    data-test="recurrence-modal"
    aria-labelledby="recurrence-modal-title"
    aria-describedby="recurrence-modal-description"
  >
    <div
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      @click.self.stop="closeRecurrenceModal"
    >
      <div class="m-3 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <header class="flex items-center justify-between">
          <h2 class="text-xl font-semibold" id="recurrence-modal-title" aria-live="assertive">
            Edit Recurrence
          </h2>
          <button
            @click.stop="closeRecurrenceModal"
            class="text-gray-500 hover:text-black"
            aria-label="Close the recurrence modal"
            data-test="close-recurrence-modal"
          >
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
        <div class="mt-4 space-y-3" id="recurrence-modal-description" aria-live="polite">
          <FwbCheckbox
            v-model="isRecurrence"
            label="Recurring"
            aria-label="Enable recurring pattern"
            data-test="recurrence-checkbox"
          />
          <RecurrenceForm
            v-if="isRecurrence"
            :is-recurring="isRecurrence"
            :pick-dates="pickDates"
            v-model:recurrence-pattern="recurrencePattern"
            data-test="recurrence-form"
          />
        </div>
        <footer class="mt-4 flex justify-between space-x-2">
          <FwbButton
            v-if="!noChanges"
            @click.stop="resetPatternChanges"
            color="yellow"
            data-test="reset-pattern-changes"
            aria-label="Reset changes to the recurrence pattern"
          >
            Reset Changes
          </FwbButton>
          <FwbButton
            v-if="!noChanges"
            @click.stop="savePatternChanges"
            color="green"
            data-test="save-pattern-changes"
            aria-label="Save the recurrence pattern changes"
          >
            Save Changes
          </FwbButton>
        </footer>
      </div>
    </div>
  </div>
</template>
