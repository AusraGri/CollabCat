<script setup lang="ts">
import { ref, computed } from 'vue'
import { FwbButton } from 'flowbite-vue'
import { useUserGroupsStore, useUserStore } from '@/stores'
import CreateTask from '../components/task/CreateTask.vue'
import CreateCategory from '@/components/categories/CreateCategory.vue'
import type { CategoriesPublic, TaskData } from '@server/shared/types'
import CategoryList from '@/components/categories/CategoryList.vue'
import TaskCard from '@/components/task/TaskCard.vue'
import Tab from '@/components/Tab.vue'
import TabRev from '@/components/TabRev.vue'
import { useRoute } from 'vue-router'
import { toggle } from '@/utils/helpers'
import {
  filterTasksByCategoryId,
  filterTasksByDefaultType,
  countTasksOfDefaultType,
} from '@/utils/tasks'

const userGroupStore = useUserGroupsStore()
const userStore = useUserStore()
const route = useRoute()

const isGroupTasks = computed(() => route.meta.group)
const isNewTask = ref(false)
const isNewCategory = ref(false)
const selectedCategory = ref(null)
const selectedDefaultCategory = ref(null)
const selectedType = ref('')
const isShowTypes = ref(false)

const groupId = computed(() => userGroupStore.activeGroup?.id)
const members = computed(() => userGroupStore.groupMembers || undefined)
const categories = computed(() => {
  if (groupId.value) {
    return userGroupStore.categories?.filter((cat) => cat.isDefault === false) || undefined
  }
  return userStore.categories?.filter((cat) => cat.isDefault === false) || undefined
})

const defaultCategories = computed(() => {
  if (groupId.value) {
    return userGroupStore.categories?.filter((cat) => cat.isDefault === true) || undefined
  }
  return userStore.categories?.filter((cat) => cat.isDefault === true) || undefined
})

// const filterTitle = computed(()=> {
//   const selectedId = selectedDefaultCategory.value
//   const defaultCat = defaultCategories.value
//   if(selectedId && defaultCat){
//  const chosen =  defaultCat.find((cat)=> cat.id === selectedId)

//  return chosen ? chosen.title : undefined
//   }

//   return undefined
// })
const filterTitle = computed(() => {
  return selectedType.value ? selectedType.value : undefined
})

const groups = computed(() => {
  if (!isGroupTasks.value) {
    return userGroupStore.userGroups || undefined
  }
  return undefined
})

// const groupTasks = computed(() => userGroupStore.tasks)
const allTasks = computed(() => {
  if (isGroupTasks.value && userGroupStore.tasks) {
    return userGroupStore.tasks
  }
  if (userStore.tasks) {
    return userStore.tasks
  }

  return []
})

const tasks = computed(() => {
  const selectedCategoryId = selectedCategory.value ? selectedCategory.value : undefined
  if (isGroupTasks.value && userGroupStore.tasks) {
    const filteredTasks = filterTasksByCategoryId({
      tasks: userGroupStore.tasks,
      categoryId: selectedCategoryId,
    })
    return filterTasksByDefaultType({ tasks: filteredTasks, title: filterTitle.value })
  }

  if (userStore.tasks) {
    const filteredTasks = filterTasksByCategoryId({
      tasks: userStore.tasks,
      categoryId: selectedCategoryId,
    })
    return filterTasksByDefaultType({ tasks: filteredTasks, title: filterTitle.value })
  }

  return []
})

function showCount (name: 'For Adoption' | 'Someday' | 'Routine' | 'Scheduled') {
  return countTasksOfDefaultType( allTasks.value, name)
}

const handleNewCategory = (category: CategoriesPublic) => {
  if (category.groupId) {
    userGroupStore.categories?.push(category)
  }
  userStore.categories?.push(category)
}

const toggleTaskModal = () => {
  isNewTask.value = !isNewTask.value
}

const toggleCategoryModal = () => {
  isNewCategory.value = !isNewCategory.value
}

const updateTasksData = (updatedTask: TaskData) => {
  if (userGroupStore.tasks && isGroupTasks.value) {
    const index = userGroupStore.tasks?.findIndex((task) => task.id === updatedTask.id)

    if (index !== -1) {
      userGroupStore.tasks[index] = updatedTask
    }

    return
  }
  if (userStore.tasks && !isGroupTasks.value) {
    const index = userStore.tasks?.findIndex((task) => task.id === updatedTask.id)

    if (index !== -1) {
      userStore.tasks[index] = updatedTask
    }

    return
  }
}

const handleNewTask = (task: TaskData) => {
  if (isGroupTasks.value) {
    userGroupStore.tasks?.push(task)
    return
  }
  userStore.tasks?.push(task)
}
const handleDefaultTypeTabClick = (tabTitle: string) => {
  const selected = selectedType.value

  if (selected === tabTitle) {
    selectedType.value = ''

    return
  }
  selectedType.value = tabTitle
}

const handleTaskDeletion = (taskId: number) => {
  if (userGroupStore.tasks && isGroupTasks.value) {
    userGroupStore.tasks = userGroupStore.tasks.filter((task) => task.id !== taskId)
  }
  if (userStore.tasks && !isGroupTasks.value) {
    userStore.tasks = userStore.tasks.filter((task) => task.id !== taskId)
  }
}

const toggleShowTypes = () => {
  toggle(isShowTypes)
}
</script>
<template>
  <!-- <div v-for="task in tasks" :key="task.id">
    <br />
    <div>{{ task }}</div>
  </div> -->
  <!-- <div>is group: {{ isGroupTasks }}</div> -->
  <!-- <div>{{ countTasksOfDefaultType(allTasks, 'Routine') }}</div> -->
  <div class="flex flex-col justify-start">
    <div class="inline-flex self-start">
      <TabRev
        :title="'+ Task'"
        @tab-click="toggleTaskModal"
        :custom-tailwind-classes="'border-amber-700'"
      />
      <TabRev
        :title="'+ Category'"
        @tab-click="toggleCategoryModal"
        :custom-tailwind-classes="'border-yellow-400'"
      />
      <div
        @click="toggleShowTypes"
        class="ml-2 flex items-center justify-end rounded-md pl-1 pr-1  text-sm  hover:cursor-pointer"
      >
        <span>Types</span>
        <svg
        v-if="!isShowTypes"
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
            d="m19 9-7 7-7-7"
          />
        </svg>
        <svg
        v-if="isShowTypes"
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
            d="m5 15 7-7 7 7"
          />
        </svg>
      </div>
    </div>
    <div
      v-if="isShowTypes"
      class="flex flex-wrap space-x-1 border-l-2 border-green-500 pl-3 sm:flex-nowrap"
    >
      <div class="inline-flex space-x-1">
        <TabRev
          :title="'Someday'"
          :is-active="selectedType"
          @tab-click="handleDefaultTypeTabClick"
        >{{showCount('Someday') }}</TabRev>
        <TabRev
          :title="'Routine'"
          :is-active="selectedType"
          @tab-click="handleDefaultTypeTabClick"
        >{{showCount('Routine') }}</TabRev>
      </div>
      <div class="inline-flex space-x-1">
        <TabRev
          :title="'Scheduled'"
          :is-active="selectedType"
          @tab-click="handleDefaultTypeTabClick"
        >{{showCount('Scheduled') }}</TabRev>
        <!-- <TabRev
          :title="'For Adoption'"
          :is-active="selectedType"
          @tab-click="handleDefaultTypeTabClick"
        /> -->
        <TabRev
          :title="'For Adoption'"
          :is-active="selectedType"
          @tab-click="handleDefaultTypeTabClick"
        >{{showCount('For Adoption') }}</TabRev>
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
      @task:new="handleNewTask"
    />
    <CreateCategory
      :is-show-modal="isNewCategory"
      :group-id="groupId"
      @create:category="handleNewCategory"
      @close="toggleCategoryModal"
    />
  </div>
  <div class="flex justify-between ">
    <div v-if="tasks">
      <div v-for="task in tasks" :key="task.id">
        <TaskCard
          :task="task"
          :categories="categories"
          :group-members="members"
          :groups="groups"
          :is-checkbox="!task.startDate"
          @task:updated="updateTasksData"
          @task:deleted="handleTaskDeletion"
        />
      </div>
    </div>
    <div v-if="categories">
      <CategoryList :categories="categories" v-model:selected-category="selectedCategory" />
    </div>
  </div>
</template>

<style scoped></style>
