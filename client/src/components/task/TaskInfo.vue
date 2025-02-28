<script setup lang="ts">
import { FwbModal, FwbButton } from 'flowbite-vue'
import type { TaskData, CategoriesPublic, GroupMember } from '@server/shared/types'
import { ref, computed, nextTick } from 'vue'
import {
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  Squares2X2Icon,
  StarIcon,
  InformationCircleIcon,
  ArrowPathRoundedSquareIcon,
} from '@heroicons/vue/24/outline'
import UserBasicProfile from '../user/UserBasicProfile.vue'
import RecurrenceCard from './RecurrenceCard.vue'
import { timeToLocalTime, formatDateToLocal, areObjectsEqual } from '@/utils/helpers'
import CategorySelect from '../categories/CategorySelect.vue'
import MembersSelection from '../groups/MembersSelection.vue'
import TaskDateModal from './TaskDateModal.vue'
import ConfirmationModal from '../ConfirmationModal.vue'
import RecurrenceChangeModal from './RecurrenceChangeModal.vue'

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'delete:task'): void
  (event: 'update:task', value: TaskData): void
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
})

const isRecurring = computed(() => (editableTask.value.recurrence ? true : false))
const isEditingTitle = ref(false)
const isEditingAssignment = ref(false)
const isEditingCategory = ref<boolean>(false)
const isEditingDate = ref(false)
const isEditingRecurrence = ref(false)
const isEditingDescription = ref(false)
const isDeleteConfirmation = ref(false)

const noChanges = computed(() => {
  const updatedTask = {
    ...editableTask.value,
    categoryId: selectedCategory.value ? Number(selectedCategory.value) : null,
    assignedUserId: assignedMember.value,
  }
  return areObjectsEqual(task, updatedTask)
})

const noEditing = computed(() => {
  return ![
    isEditingTitle.value,
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

const descriptionLabel = computed(() => {
  if (editableTask.value.description) return `Description:`
  return `No Description`
})

const resetAllEditingValues = () => {
  isEditingTitle.value = false
  isEditingPoints.value = false
  isEditingAssignment.value = false
  isEditingDate.value = false
  isEditingCategory.value = false
  isEditingRecurrence.value = false
  isEditingDescription.value = false
}

const closeModal = () => {
  resetAllEditingValues()
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
  isEditingTitle.value = false
}

const validateDescriptionAndSave = () => {
  const maxLength = 200
  const minLength = 2
  const description = editableTask.value.description
  console.log(description)
  if (!description) {
    editableTask.value.description = null
    isEditingDescription.value = false

    return
  }
  const descriptionTrimmed = description.trim()
  if (descriptionTrimmed.length < minLength || descriptionTrimmed.length > maxLength) {
    errorMessage.value = 'Description must be between 3 and 50 characters long.'
    return
  }
  editableTask.value.description = descriptionTrimmed
  errorMessage.value = ''
  isEditingDescription.value = false
}

const validatePointsAndSave = () => {
  const points = editableTask.value.points
  if (!points || points === 0) {
    editableTask.value.points = null
    isEditingPoints.value = false
    return
  }
  if (points > 999) {
    errorMessage.value = 'Points must be between 1 and 999.'
    return
  }
  errorMessage.value = ''
  isEditingPoints.value = false
}

const handleConfirmation = (value: boolean) => {
  if (!value) {
    isDeleteConfirmation.value = false
    return
  }
  isDeleteConfirmation.value = false
  emit('delete:task')
  emit('close')
}

const deleteTask = () => {
  isDeleteConfirmation.value = true
}
const saveChanges = () => {
  const updatedTask = {
    ...editableTask.value,
    categoryId: selectedCategory.value ? Number(selectedCategory.value) : null,
    assignedUserId: assignedMember.value,
    isRecurring: editableTask.value.recurrence ? true : false,
  }
  emit('update:task', updatedTask)
  emit('close')
}
</script>
<template>
  <FwbModal
    v-if="isShowModal"
    @close="closeModal"
    role="dialog"
    aria-labelledby="modalTitle"
    aria-hidden="false"
  >
    <template #header>
      <div class="flex w-fit flex-col justify-between text-lg">
        <div
          @click="startEditingTitle"
          v-if="!isEditingTitle"
          role="heading"
          aria-level="1"
          id="modalTitle"
        >
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
          aria-label="Edit task title"
          aria-describedby="titleError"
        />
        <p v-if="errorMessage && isEditingTitle" id="titleError" class="text-sm text-red-500">
          {{ errorMessage }}
        </p>
      </div>
    </template>
    <template #body>
      <div class="text-md flex w-full flex-col justify-between space-y-3 divide-y">
        <div
          @click="isEditingCategory = true"
          class="flex cursor-pointer items-center space-x-3"
          role="button"
          aria-label="Edit category"
        >
          <Squares2X2Icon class="w-7 text-black" />
          <label for="categorySelect" class="text-sm font-bold"> Category:</label>
          <CategorySelect
            id="categorySelect"
            v-if="categories && isEditingCategory"
            :categories="categories"
            v-model:selected-category="selectedCategory"
            aria-label="Select a category"
            data-test="select-category"
          />
          <span v-else>{{ categoryLabel }}</span>
        </div>
        <div
        v-if="groupMembers?.length"
          class="flex w-full items-center justify-between space-x-3 pt-3"
          @click="isEditingAssignment = true"
          role="button"
          aria-label="Edit task assignment"
          data-test="edit-assignment"
        >
          <div class="flex items-center space-x-3">
            <UsersIcon class="w-7" />
            <div class="text-sm font-bold">
              {{ assignedText }}
            </div>
            <div v-if="assignedTo">
              <UserBasicProfile :user="assignedTo" :aria-label="assignedTo.username" />
            </div>
          </div>
          <div v-if="isEditingAssignment">
            <MembersSelection
              v-if="groupMembers"
              :group-members="groupMembers"
              :max-selections="1"
              v-model:selected-members="selectedMember"
              aria-label="Select a member"
              data-test="select-member"
            />
          </div>
        </div>
        <div class="flex h-11 items-center space-x-3 pt-3">
          <div
            @click="startEditingPoints"
            class="flex cursor-pointer items-center space-x-3"
            role="button"
            aria-label="Edit task points"
          >
            <StarIcon class="w-7" />
            <div class="text-sm font-bold">{{ pointsLabel }}</div>
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
              aria-label="Edit task points"
              aria-describedby="pointsError"
            />
            <p v-if="errorMessage && isEditingPoints" id="pointsError" class="text-sm text-red-500">
              {{ errorMessage }}
            </p>
          </div>
        </div>
        <div
          class="flex cursor-pointer flex-col pt-3 sm:flex-row sm:space-x-3"
          @click="editDate"
          role="button"
          aria-label="Edit task dates"
        >
          <div class="flex items-center space-x-2">
            <div>
              <CalendarDaysIcon class="w-7" />
            </div>
            <div class="flex flex-nowrap p-1 text-sm">
              <div v-if="editableTask.startDate" aria-label="Task Start Date">
                {{ formatDateToLocal(editableTask.startDate) }}
              </div>
              <div v-if="editableTask.endDate" aria-label="Task End Date">
                <span class="ml-2 mr-2">--></span>
                <span>{{ formatDateToLocal(editableTask.endDate) }}</span>
              </div>
            </div>
          </div>
          <div
            v-if="editableTask.startTime && editableTask.startDate"
            class="flex items-center space-x-3 text-sm"
          >
            <span>
              <ClockIcon class="w-7" />
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
            aria-labelledby="taskDateModal"
            aria-describedby="taskDateModalDescription"
          />
        </div>
        <div
          class="flex cursor-pointer items-center space-x-3 pt-3"
          @click="startEditingRecurrence"
          role="button"
          aria-label="Edit task recurrence"
          data-test="edit-recurrence"
        >
          <div class="flex items-center space-x-2 text-sm font-bold">
            <ArrowPathRoundedSquareIcon class="w-7" />
            <span v-if="!editableTask.recurrence">No Repeat</span>
          </div>
          <div v-if="editableTask.recurrence">
            <RecurrenceCard :recurrence="editableTask.recurrence" />
          </div>
          <RecurrenceChangeModal
            :is-recurring="isRecurring"
            :pick-dates="false"
            :is-show-recurrence="isEditingRecurrence"
            v-model:recurrence-pattern="editableTask.recurrence"
            @close-recurrence="stopEditingRecurrence"
            aria-label="Recurrence Modal"
            data-test="recurrence-modal"
          />
        </div>
        <div class="flex flex-col pt-3">
          <div
            @click="startEditingDescription"
            class="space-y-2"
            role="button"
            aria-label="Edit task description"
            data-test="edit-task-description"
          >
            <div class="flex w-fit items-center space-x-2 whitespace-nowrap">
              <InformationCircleIcon class="w-7" />
              <div class="cursor-pointer text-sm font-bold">{{ descriptionLabel }}</div>
            </div>
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
                aria-label="Edit task description"
                aria-describedby="descriptionError"
              />
              <p
                v-if="errorMessage && isEditingDescription"
                class="text-sm text-red-500"
                id="descriptionError"
              >
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <ConfirmationModal
          :is-show-modal="isDeleteConfirmation"
          :action="'delete'"
          :object="editableTask.title"
          @confirmed="handleConfirmation"
        />
        <FwbButton
          @click="deleteTask"
          color="red"
          size="xs"
          aria-label="Delete task"
          data-test="delete-task"
        >
          <TrashIcon class="w-7 text-slate-50" />
        </FwbButton>
        <FwbButton
          v-if="!noChanges && noEditing"
          @click="saveChanges"
          color="green"
          aria-label="Save task changes"
          data-test="save-task-changes"
        >
          Save changes
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>
