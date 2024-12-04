<script setup lang="ts">
import { ref, watch} from 'vue'

const props = defineProps({
  isRecurring: {
    type: Boolean,
    required: true
  }
})

const isModalVisible = ref(props.isRecurring)

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const recurringForm = ref({
  startDate: '', // Start date for recurrence
  endDate: '', // End date for recurrence
  type: 'daily', // Recurrence type: daily or weekly
  everyXDays: 1, // Number of days for daily recurrence
  weekdays: [], // Weekdays selected for weekly recurrence
  everyXWeeks: 1, // Number of weeks for weekly recurrence
})

function submitRecurringForm () {
    console.log(recurringForm.value)
}

function closeModal() {
     isModalVisible.value = false; // Close the modal
      // Reset the form data if necessary
      recurringForm.value = {
        startDate: "",
        endDate: "",
        type: "daily",
        everyXDays: 1,
        weekdays: [],
        everyXWeeks: 1,
      };
    }

    watch(
  () => props.isRecurring,
  (newValue) => {
    isModalVisible.value = newValue;
  }
);
</script>

<template>
    <div v-if="isModalVisible" class="w-full rounded-lg bg-white p-6 shadow-lg sm:w-96">
      <h2 class="mb-4 text-xl font-semibold">Recurring Task Details</h2>
      <form @submit.prevent="submitRecurringForm" class="space-y-4">
        <!-- Recurring Start Date -->
        <div class="flex flex-col">
          <label for="recurringStartDate" class="mb-2 text-lg font-medium">Start Date</label>
          <input
            v-model="recurringForm.startDate"
            id="recurringStartDate"
            type="date"
            class="rounded-lg border border-gray-300 p-2"
            required
          />
        </div>
  
        <!-- Recurring End Date -->
        <div class="flex flex-col">
          <label for="recurringEndDate" class="mb-2 text-lg font-medium">End Date</label>
          <input
            v-model="recurringForm.endDate"
            id="recurringEndDate"
            type="date"
            class="rounded-lg border border-gray-300 p-2"
            required
          />
        </div>
  
        <!-- Recurring Type -->
        <div class="flex flex-col">
          <label for="recurringType" class="mb-2 text-lg font-medium">Recurring Type</label>
          <select
            v-model="recurringForm.type"
            id="recurringType"
            class="rounded-lg border border-gray-300 p-2"
            required
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
  
        <!-- Daily Recurrence (show if selected) -->
        <div v-if="recurringForm.type === 'daily'" class="flex flex-col">
          <label for="everyXDays" class="mb-2 text-lg font-medium">Every X days</label>
          <input
            v-model="recurringForm.everyXDays"
            id="everyXDays"
            type="number"
            min="1"
            class="rounded-lg border border-gray-300 p-2"
          />
        </div>
  
        <!-- Weekly Recurrence (show if selected) -->
        <div v-if="recurringForm.type === 'weekly'" class="space-y-4">
          <div class="flex flex-col">
            <label class="mb-2 text-lg font-medium">Weekdays</label>
            <div class="flex gap-2">
              <label v-for="day in weekdays" :key="day" class="flex items-center">
                <input type="checkbox" v-model="recurringForm.weekdays" :value="day" class="mr-2" />
                {{ day }}
              </label>
            </div>
          </div>
  
          <div class="flex flex-col">
            <label for="everyXWeeks" class="mb-2 text-lg font-medium">Every X weeks</label>
            <input
              v-model="recurringForm.everyXWeeks"
              id="everyXWeeks"
              type="number"
              min="1"
              class="rounded-lg border border-gray-300 p-2"
            />
          </div>
        </div>
      </form>
    </div>
  </template>
<style scoped></style>
