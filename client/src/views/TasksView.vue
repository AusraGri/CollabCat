<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/outline'
import {
  useUserGroupsStore,
  useCategoriesStore,
  useUserStore,
  usePointsStore,
  useTasksStore,
} from '@/stores'
import CreateTask from '../components/task/CreateTask.vue'
import CreateCategory from '@/components/categories/CreateCategory.vue'
import CategoryList from '@/components/categories/CategoryList.vue'
import TaskCard from '@/components/task/TaskCard.vue'
import TabRev from '@/components/TabRev.vue'
import { useRoute } from 'vue-router'
import { toggle } from '@/utils/helpers'
import { trpc } from '@/trpc'
import { sortTasksByCompleted } from '@/utils/tasks'
import {
  filterTasksByCategoryId,
  filterTasksByDefaultType,
  countTasksOfDefaultType,
} from '@/utils/tasks'

const userGroupStore = useUserGroupsStore()
const categoryStore = useCategoriesStore()
const userStore = useUserStore()
const pointsStore = usePointsStore()
const taskStore = useTasksStore()
const route = useRoute()

const isGroupTasks = computed(() => route.meta.group)
const isNewTask = ref(false)
const isNewCategory = ref(false)
const selectedCategory = ref(null)
const selectedType = ref('')
const isShowTypes = ref(false)

const groupId = computed(() => userGroupStore.activeGroup?.id)
const members = computed(() => userGroupStore.groupMembers || undefined)
const categories = computed(() => {
  if (groupId.value) {
    return categoryStore.groupCategories || undefined
  }
  return categoryStore.userCategories || undefined
})

const filterTitle = computed(() => {
  return selectedType.value ? selectedType.value : undefined
})

const groups = computed(() => {
  if (!isGroupTasks.value) {
    return userGroupStore.userGroups || undefined
  }
  return undefined
})

const allTasks = computed(() => taskStore.tasks)
const tasks = computed(() => {
  const selectedCategoryId = selectedCategory.value ? selectedCategory.value : undefined
  const filteredTasks = filterTasksByCategoryId({
    tasks: allTasks.value,
    categoryId: selectedCategoryId,
  })

  const filteredByDefault = filterTasksByDefaultType({
    tasks: filteredTasks,
    title: filterTitle.value,
  })

  return sortTasksByCompleted(filteredByDefault)
})

function showCount(name: 'Not Assigned' | 'Someday' | 'Routine' | 'Scheduled') {
  return countTasksOfDefaultType(allTasks.value, name)
}

const toggleTaskModal = () => {
  isNewTask.value = !isNewTask.value
}

const toggleCategoryModal = () => {
  isNewCategory.value = !isNewCategory.value
}

const handleDefaultTypeTabClick = (tabTitle: string) => {
  const selected = selectedType.value

  if (selected === tabTitle) {
    selectedType.value = ''

    return
  }
  selectedType.value = tabTitle
}

const toggleShowTypes = () => {
  toggle(isShowTypes)
  if (!isShowTypes.value) {
    selectedType.value = ''
  }
}
const handleTaskStatusChange = async (taskData: {
  id: number
  isCompleted: boolean
  points: number | null
  groupId: number | null
}) => {
  const { id, isCompleted, points } = taskData

  const date = new Date()
  const taskCompletionData = {
    id,
    isCompleted,
    instanceDate: date,
  }

  try {
    await taskStore.updateTaskCompletion(taskCompletionData)
    if (points && isCompleted) {
      const isPointsEnabled = pointsStore.isPointsEnabled

      if (isPointsEnabled) {
        const isClaimed = await trpc.points.isUserClaimedPoints.query({
          taskId: id,
          taskInstanceDate: date,
        })

        if (isClaimed) return

        if (!isClaimed) {
          pointsStore.alterPoints('+', points)
          await trpc.points.addClaimedPoints.mutate({ taskId: id, taskInstanceDate: date })
        }
      }
    }
  } catch (error) {
    console.log('Failed to update task status', error)
  }
}

onMounted(async () => {
  if (groupId.value) {
    await taskStore.getGroupTasks(groupId.value)
  } else if (userStore.user) {
    await taskStore.getPersonalTasks(userStore.user.id)
  }
})

watch(
  () => groupId.value,
  async (newValue) => {
    if (newValue) {
      await taskStore.getGroupTasks(newValue)
      return
    }

    if (userStore.user && !newValue) {
      await taskStore.getPersonalTasks(userStore.user.id)
    }
  }
)
</script>

<template>
  <div class="flex flex-col justify-start">
    <div class="inline-flex self-start">
      <TabRev
        :title="'+ Task'"
        @tab-click="toggleTaskModal"
        :custom-tailwind-classes="'border-amber-700'"
        aria-label="Create New Task Modal"
      />
      <TabRev
        :title="'+ Category'"
        @tab-click="toggleCategoryModal"
        :custom-tailwind-classes="'border-yellow-400'"
        aria-label="Create New Category"
      />
      <div
        @click="toggleShowTypes"
        class="ml-2 flex items-center justify-end rounded-md pl-1 pr-1 text-sm hover:cursor-pointer"
        :aria-expanded="isShowTypes"
        aria-controls="types-container"
      >
        <span>Types</span>
        <ChevronDownIcon
          v-if="!isShowTypes"
          class="ml-1 h-5 w-5 text-gray-800 dark:text-white"
          aria-hidden="true"
        />
        <ChevronUpIcon
          v-if="isShowTypes"
          class="ml-1 h-5 w-5 text-gray-800 dark:text-white"
          aria-hidden="true"
        />
      </div>
    </div>
    <div
      v-if="isShowTypes"
      class="flex flex-wrap space-x-1 border-l-2 border-green-500 pl-3 sm:flex-nowrap"
      id="types-container"
    >
      <div class="inline-flex space-x-1">
        <TabRev
          :title="'Someday'"
          :is-active="selectedType"
          @tab-click="handleDefaultTypeTabClick"
          aria-label="Filter Someday Tasks"
          >{{ showCount('Someday') }}</TabRev
        >
        <TabRev
          :title="'Routine'"
          :is-active="selectedType"
          @tab-click="handleDefaultTypeTabClick"
          aria-label="Filter Routine Tasks"
          >{{ showCount('Routine') }}</TabRev
        >
      </div>
      <div class="inline-flex space-x-1">
        <TabRev
          :title="'Scheduled'"
          :is-active="selectedType"
          @tab-click="handleDefaultTypeTabClick"
          aria-label="Filter Scheduled Tasks"
          >{{ showCount('Scheduled') }}</TabRev
        >
        <TabRev
          v-if="isGroupTasks"
          :title="'Not Assigned'"
          :is-active="selectedType"
          @tab-click="handleDefaultTypeTabClick"
          aria-label="Filter Not Assigned Tasks"
          >{{ showCount('Not Assigned') }}</TabRev
        >
      </div>
    </div>
  </div>
  <div class="flex justify-between border-t-2">
    <CreateTask
      :is-show-modal="isNewTask"
      :group-id="groupId"
      :group-members="members"
      :categories="categories"
      @close="toggleTaskModal"
      aria-label="Create a new task"
    />
    <CreateCategory
      :is-show-modal="isNewCategory"
      :group-id="groupId"
      @close="toggleCategoryModal"
      aria-label="Create a new category"
    />
  </div>
  <div class="mt-3 flex justify-around space-x-1">
    <div v-if="tasks" class="flex flex-col">
      <div v-for="task in tasks" :key="task.id">
        <TaskCard
          class="items-stretch"
          :task="task"
          :categories="categories"
          :group-members="members"
          :groups="groups"
          :is-checkbox="!task.startDate"
          @task:status="handleTaskStatusChange"
        />
      </div>
    </div>
    <div v-if="categories" class="w-fit whitespace-nowrap">
      <CategoryList
        :categories="categories"
        v-model:selected-category="selectedCategory"
        aria-label="Select a category"
      />
    </div>
  </div>
</template>
