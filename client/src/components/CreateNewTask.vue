<script setup lang="ts">
import { ref } from 'vue'
import ReccuranceForm from './ReccuranceForm.vue'

const taskForm = ref({
  title: 'New Test Task',
  dueDate: '',
  description: 'some description',
  recurring: false,
})


function submitForm() {
  console.log(taskForm.value)
}
</script>

<template>
  <div class="mx-auto max-w-lg rounded-lg bg-white p-4 shadow-md">
    <h2 class="mb-4 text-2xl font-semibold">Create a New Task</h2>
    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Title Input -->
      <div class="flex flex-col">
        <label for="title" class="mb-2 text-lg font-medium">Title</label>
        <input
          v-model="taskForm.title"
          id="title"
          type="text"
          class="rounded-lg border border-gray-300 p-2"
          placeholder="Enter task title"
          required
        />
      </div>

      <!-- Description Input -->
      <div class="flex flex-col">
        <label for="description" class="mb-2 text-lg font-medium">Description</label>
        <textarea
          v-model="taskForm.description"
          id="description"
          rows="4"
          class="rounded-lg border border-gray-300 p-2"
          placeholder="Enter task description"
        />
      </div>

      <!-- Recurring Checkbox -->
      <div class="flex items-center">
        <input v-model="taskForm.recurring" id="recurring" type="checkbox" class="mr-2" />
        <label for="recurring" class="text-lg">Recurring</label>
      </div>

      <!-- Date and Time Input -->
      <div class="flex flex-col">
        <label for="dueDate" class="mb-2 text-lg font-medium">Due Date and Time</label>
        <VueDatePicker
          v-model="taskForm.dueDate"
          id="dueDate"
          label="Due Date and Time"
        ></VueDatePicker>
      </div>

      <div>
        <ReccuranceForm :is-recurring="taskForm.recurring"/>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
        >
          Create Task
        </button>
      </div>
    </form>
  </div>
</template>
<style scoped></style>
