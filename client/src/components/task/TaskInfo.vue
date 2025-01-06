<script setup lang="ts">
import { FwbModal, FwbButton, FwbInput } from 'flowbite-vue'
import type { TaskData, CategoriesPublic, GroupMember } from '@server/shared/types'
import { ref, computed, nextTick } from 'vue'
import UserBasicProfile from '../user/UserBasicProfile.vue'
import RecurrenceCard from './RecurrenceCard.vue'
import { timeToLocalTime, formatDateToLocal } from '@/utils/helpers'
import CategorySelect from '../categories/CategorySelect.vue'
import MembersSelection from '../groups/MembersSelection.vue'
import { type Ref } from 'vue'
import { error } from 'console'

const emit = defineEmits<{
  (event: 'close'): void
}>()

const { task, categories, groupMembers, isShowModal } = defineProps<{
  categories?: CategoriesPublic[]
  task: TaskData
  groupMembers?: GroupMember[]
  isShowModal: boolean
}>()

const errorMessage = ref()
const selectedCategory = ref(String(task.categoryId) || undefined)
const selectedMember = ref(task.assignedUserId ? [task.assignedUserId] : [])
const assignedMember = computed(() =>
  selectedMember.value[0] ? selectedMember.value[0] : undefined
)
const isEditingPoints = ref(false)
const editableTask = ref({
    ...task,
    categoryId: selectedCategory.value ? Number(selectedCategory.value) : undefined,
    assignedUserId: assignedMember.value,
//   title: task.title,
//   assignedUserId: assignedMember.value,
//   recurrence: task.recurrence,
//   points: task.points,
//   categoryId: selectedCategory.value ? Number(selectedCategory.value) : undefined,
//   description: task.description,
//   startDate: task.startDate,
//   endDate: task.endDate
})
const isEditingTitle = ref(false)
const isEditingAssignment = ref(false)
const isEditingCategory = ref<boolean>(false)

const assignedTo = computed(() => {
  if (assignedMember.value && groupMembers) {
    return groupMembers.find((member) => member.id === assignedMember.value)
  }
  return null
})

const assignedText = computed(() => {
  if (assignedTo.value) return `Assigned To:`
  return `Assign To`
})

const pointsLabel = computed(() => {
  if (editableTask.value.points) return `Task Points:`
  return `Add Points`
})

const recurrenceLabel = computed(() => {
  if (task.recurrence) return `Repeat:`
  return `No Repeating`
})

const descriptionLabel = computed(() => {
  if (task.description) return `Description:`
  return `No Description`
})

const closeModal = () => {
  emit('close')
}

const titleInput = ref<HTMLInputElement | null>(null)
const pointsInput = ref<HTMLInputElement | null>(null)

const startEditingTitle = () => {
  isEditingTitle.value = true
  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus()
    }
  })
}
const startEditingPoints = () => {
  isEditingPoints.value = true
  nextTick(() => {
    if (pointsInput.value) {
      pointsInput.value.focus()
    }
  })
}

const toggle = (value: Ref<boolean>) => {
  value.value = !value.value
}

const validateTitleAndSave = () => {
  const title = editableTask.value.title.trim()
  if (title.length < 3 || title.length > 20) {
    errorMessage.value = 'Title must be between 3 and 20 characters long.'
    return
  }
  errorMessage.value = ''
  saveChanges()
}

const validateDescriptionAndSave = () => {
  if (!editableTask.value.description) {
    saveChanges()
    return
  }
  const description = editableTask.value.description.trim()
  if (description.length < 3 || description.length > 50) {
    errorMessage.value = 'Description must be between 3 and 50 characters long.'
    return
  }
  errorMessage.value = ''
  saveChanges()
}

const validatePointsAndSave = () => {
  if (!editableTask.value.points) {
    saveChanges()
    return
  }
  const points = editableTask.value.points
  if (points > 999) {
    errorMessage.value = 'Points must be between 1 and 999.'
    return
  }
  errorMessage.value = ''
  saveChanges()
}

const saveChanges = () => {
  isEditingTitle.value = false
  isEditingPoints.value = false
}
</script>
<template>
  <div>
    <FwbModal v-if="isShowModal" @close="closeModal">
      <template #header>
        <div class="flex w-fit flex-col justify-between text-lg">
          <div @click="startEditingTitle" v-if="!isEditingTitle">
            {{ editableTask.title }}
          </div>
          <input
            v-else
            v-model="editableTask.title"
            @blur="validateTitleAndSave"
            @keyup.enter="validateTitleAndSave"
            type="text"
            ref="titleInput"
            class="rounded border-0 p-1"
          />
          <p v-if="errorMessage && isEditingTitle" class="text-sm text-red-500">
            {{ errorMessage }}
          </p>
        </div>
      </template>
      <template #body>
        <div class="text-md flex w-full flex-col justify-between space-y-3 divide-y">
          <div @click="isEditingCategory = true" class="flex cursor-pointer items-center space-x-3">
            <span>Category:</span>
            <CategorySelect
              v-if="categories && isEditingCategory"
              :categories="categories"
              :selected-category="selectedCategory"
            />
            <span v-else>Uncategorized</span>
          </div>
          <div
            class="flex w-full items-center justify-between space-x-3 pt-3"
            @click="isEditingAssignment = true"
          >
            <div class="flex items-center space-x-3">
              <div>
                {{ assignedText }}
              </div>
              <div v-if="assignedTo">
                <UserBasicProfile :user="assignedTo" />
              </div>
            </div>
            <div v-if="isEditingAssignment">
              <MembersSelection
                v-if="groupMembers"
                :group-members="groupMembers"
                :max-selections="1"
                v-model:selected-members="selectedMember"
              />
            </div>
          </div>
          <div class="flex h-11 items-center space-x-3 pt-3">
            <div @click="startEditingPoints" class="flex cursor-pointer space-x-3">
              <div>{{ pointsLabel }}</div>
              <div v-if="editableTask.points && !isEditingPoints">{{ editableTask.points }}</div>
            </div>
            <div>
              <input
                v-if="isEditingPoints"
                v-model="editableTask.points"
                @blur="validatePointsAndSave"
                @keyup.enter="validatePointsAndSave"
                type="number"
                min="1"
                ref="pointsInput"
                class="rounded border-0 p-1"
              />
              <p v-if="errorMessage && isEditingPoints" class="text-sm text-red-500">
                {{ errorMessage }}
              </p>
            </div>
          </div>
          <div class="flex space-x-3 pt-3 items-center">
            <div>Date:</div>
            <div class="p-1 text-sm">
              {{ formatDateToLocal(task.startDate) }}
              <span v-if="task.endDate">--> {{ formatDateToLocal(task.endDate) }}</span>
            </div>
            <div v-if="task.startTime" class="p-1 text-sm flex space-x-1 items-center">
              <span
                ><svg
                  class="h-6 w-6 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </span>
              <div>
                  {{ timeToLocalTime(task.startTime, task.startDate) }}
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-3 pt-3">
            <div>{{ recurrenceLabel }}</div>
            <div v-if="task.recurrence">
              <RecurrenceCard :recurrence="task.recurrence" />
            </div>
          </div>
          <div class="flex flex-col pt-3">
            <div>{{ descriptionLabel }}</div>
            <p class="text-sm">{{ task.description }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between">
          <FwbButton color="red" size="xs">delete</FwbButton>
          <fwb-button @click="confirmAction(false)" color="green">Save changes </fwb-button>
        </div>
      </template>
    </FwbModal>
  </div>
</template>
