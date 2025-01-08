<script setup lang="ts">
import { FwbModal, FwbButton } from 'flowbite-vue'
import type { TaskData, CategoriesPublic, GroupMember } from '@server/shared/types'
import { ref, computed, nextTick } from 'vue'
import UserBasicProfile from '../user/UserBasicProfile.vue'
import RecurrenceCard from './RecurrenceCard.vue'
import { timeToLocalTime, formatDateToLocal, areObjectsEqual } from '@/utils/helpers'
import CategorySelect from '../categories/CategorySelect.vue'
import MembersSelection from '../groups/MembersSelection.vue'
import TaskDateModal from './TaskDateModal.vue'
import RecurrenceChangeModal from './RecurrenceChangeModal.vue'

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
const selectedCategory = ref(task.categoryId ? String(task.categoryId) : '')
const selectedMember = ref(task.assignedUserId ? [task.assignedUserId] : [])
const assignedMember = computed(() => (selectedMember.value[0] ? selectedMember.value[0] : null))
const isEditingPoints = ref(false)
const editableTask = ref({
  ...task,
  categoryId: selectedCategory.value ? Number(selectedCategory.value) : null,
  assignedUserId: assignedMember.value,
})

const isRecurring = computed(() => (editableTask.value.recurrence ? true : false))
const isEditingTitle = ref(false)
const isEditingAssignment = ref(false)
const isEditingCategory = ref<boolean>(false)
const isEditingDate = ref(false)
const isEditingRecurrence = ref(false)
const isEditingDescription = ref(false)

const noChanges = computed(() => {
  return areObjectsEqual(task, editableTask.value)
})
const noEditing = computed(() => {
  return ![
    isEditingTitle.value,
    isEditingAssignment.value,
    isEditingCategory.value,
    isEditingDate.value,
    isEditingRecurrence.value,
    isEditingDescription.value,
  ].some((editing) => editing)
})

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

const categoryLabel = computed(() => {
  const categoryId = editableTask.value.categoryId
  if (!categoryId) return `Uncategorized`

  const category = categories?.find((category) => category.id === categoryId)

  return category?.title
})

const pointsLabel = computed(() => {
  if (editableTask.value.points) return `Task Points:`
  return `Add Points`
})

const recurrenceLabel = computed(() => {
  if (editableTask.value.recurrence) return `Repeat:`
  return `No Repeating`
})

const descriptionLabel = computed(() => {
  if (editableTask.value.description) return `Description:`
  return `No Description`
})

const resetEditingValues = () => {
  isEditingTitle.value = false
  isEditingPoints.value = false
  isEditingAssignment.value = false
  isEditingDate.value = false
  isEditingCategory.value = false
  isEditingRecurrence.value = false
  isEditingDescription.value = false
}

const closeModal = () => {
  resetEditingValues()
  editableTask.value = {
    ...task,
    categoryId: selectedCategory.value ? Number(selectedCategory.value) : null,
    assignedUserId: assignedMember.value,
  }
  emit('close')
}

const titleInput = ref<HTMLInputElement | null>(null)
const pointsInput = ref<HTMLInputElement | null>(null)
const descriptionInput = ref<HTMLTextAreaElement | null>(null)

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

const startEditingDescription = () => {
  isEditingDescription.value = true
  nextTick(() => {
    if (descriptionInput.value) {
      descriptionInput.value.focus()
    }
  })
}

const editDate = () => {
  isEditingDate.value = true
}

const startEditingRecurrence = () => {
  isEditingRecurrence.value = true
}

const stopEditingRecurrence = () => {
  isEditingRecurrence.value = false
  if (!editableTask.value.recurrence) {
    editableTask.value.endDate = null
  }
}

const stopEditingDate = () => {
  isEditingDate.value = false
}

const validateTitleAndSave = () => {
  const title = editableTask.value.title.trim()
  if (title.length < 3 || title.length > 20) {
    errorMessage.value = 'Title must be between 3 and 20 characters long.'
    return
  }
  editableTask.value.title = title
  errorMessage.value = ''
  saveChanges()
}

const validateDescriptionAndSave = () => {
  const maxLength = 200
  const minLength = 2
  const description = editableTask.value.description
  console.log(description)
  if (!description) {
    editableTask.value.description = null
    saveChanges()
    return
  }
  const descriptionTrimmed = description.trim()
  if (descriptionTrimmed.length < minLength || descriptionTrimmed.length > maxLength) {
    errorMessage.value = 'Description must be between 3 and 50 characters long.'
    return
  }
  editableTask.value.description = descriptionTrimmed
  errorMessage.value = ''
  saveChanges()
}

const validatePointsAndSave = () => {
  const points = editableTask.value.points
  if (!points) {
    saveChanges()
    return
  }
  if (points > 999) {
    errorMessage.value = 'Points must be between 1 and 999.'
    return
  }
  errorMessage.value = ''
  saveChanges()
}

const saveChanges = () => {
  //save changes
  resetEditingValues()
}
</script>
<template>
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
          @keydown.enter.prevent="validateTitleAndSave"
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
            v-model:selected-category="selectedCategory"
          />
          <span v-else>{{ categoryLabel }}</span>
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
        <div class="flex cursor-pointer items-center space-x-3 pt-3" @click="editDate">
          <div>Date:</div>
          <div class="p-1 text-sm">
            {{ formatDateToLocal(editableTask.startDate) }}
            <span v-if="editableTask.endDate"
              >--> {{ formatDateToLocal(editableTask.endDate) }}</span
            >
          </div>
          <div v-if="editableTask.startTime" class="flex items-center space-x-1 p-1 text-sm">
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
              {{ timeToLocalTime(editableTask.startTime, editableTask.startDate) }}
            </div>
          </div>
          <TaskDateModal
            :is-recurring="isRecurring"
            :is-show-date-modal="isEditingDate"
            v-model:start-date="editableTask.startDate"
            v-model:end-date="editableTask.endDate"
            v-model:start-time="editableTask.startTime"
            @close-date="stopEditingDate"
          />
        </div>
        <div
          class="flex cursor-pointer items-center space-x-3 pt-3"
          @click="startEditingRecurrence"
        >
          <div>{{ recurrenceLabel }}</div>
          <div v-if="editableTask.recurrence">
            <RecurrenceCard :recurrence="editableTask.recurrence" />
          </div>
          <RecurrenceChangeModal
            :is-recurring="isRecurring"
            :pick-dates="false"
            :is-show-recurrence="isEditingRecurrence"
            v-model:recurrence-pattern="editableTask.recurrence"
            @close-recurrence="stopEditingRecurrence"
          />
        </div>
        <div class="flex flex-col pt-3">
          <div @click="startEditingDescription" class="space-y-2">
            <div class="cursor-pointer">{{ descriptionLabel }}</div>
            <p v-if="!isEditingDescription" class="text-sm">{{ editableTask.description }}</p>
            <div v-if="isEditingDescription">
              <textarea
                v-model="editableTask.description"
                rows="1"
                maxlength="200"
                placeholder="Write your task description"
                class="w-full rounded border-0 p-1 text-sm"
                @blur="validateDescriptionAndSave"
                @keydown.enter.prevent="validateDescriptionAndSave"
                ref="descriptionInput"
              />
              <p v-if="errorMessage && isEditingDescription" class="text-sm text-red-500">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <FwbButton color="red" size="xs">
          <svg
            class="h-6 w-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="white"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
            />
          </svg>
        </FwbButton>
        <fwb-button v-if="!noChanges && noEditing" @click="saveChanges" color="green"
          >Save changes
        </fwb-button>
      </div>
    </template>
  </FwbModal>
</template>
