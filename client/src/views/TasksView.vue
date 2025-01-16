<script setup lang="ts">
import { ref, computed } from 'vue'
import { FwbButton } from 'flowbite-vue'
import { useUserGroupsStore, useUserStore } from '@/stores'
import CreateTask from '../components/task/CreateTask.vue'
import CreateCategory from '@/components/categories/CreateCategory.vue'
import type { CategoriesPublic, TaskData } from '@server/shared/types'
import CategoryList from '@/components/categories/CategoryList.vue'
import TaskCard from '@/components/task/TaskCard.vue'
import { useRoute } from 'vue-router'

const userGroupStore = useUserGroupsStore()
const userStore = useUserStore()
const route = useRoute()

const isGroupTasks = computed(() => route.meta.group)
const isNewTask = ref(false)
const isNewCategory = ref(false)
const selectedCategory = ref(null)
const selectedDefaultCategory = ref(null)

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

const filterTitle = computed(()=> {
  const selectedId = selectedDefaultCategory.value
  const defaultCat = defaultCategories.value
  if(selectedId && defaultCat){
 const chosen =  defaultCat.find((cat)=> cat.id === selectedId)

 return chosen ? chosen.title : undefined
  }

  return undefined
})

const groups = computed(() => {
  if (!isGroupTasks.value) {
    return userGroupStore.userGroups || undefined
  }
  return undefined
})

// const groupTasks = computed(() => userGroupStore.tasks)

const tasks = computed(() => {
  const selectedCategoryId = selectedCategory.value ? selectedCategory.value : undefined
  if (isGroupTasks.value && userGroupStore.tasks) {
    const filteredTasks = filterTasksByCategory({
      tasks: userGroupStore.tasks,
      categoryId: selectedCategoryId,
    })
    return filterTasksByDefault({tasks:filteredTasks, title: filterTitle.value})
  }

  if (userStore.tasks) {
    return filterTasksByCategory({ tasks: userStore.tasks, categoryId: selectedCategoryId })
  }

  return []
})

function filterTasksByCategory(filter: { categoryId?: number; tasks: TaskData[] }): TaskData[] {
  if (filter.categoryId) {
    return filter.tasks.filter((task) => task.categoryId === filter.categoryId)
  }
  return filter.tasks
}

function filterTasksByDefault(filter: { title?: string; tasks: TaskData[] }): TaskData[] {
  if(!filter.title){

    return filter.tasks
  }
  else if (filter.title === 'Routine') {

    return filter.tasks.filter((task) => task.isRecurring === true)
  } else if (filter.title === 'Someday') {

    return filter.tasks.filter((task) => task.startDate === null)
  } else if (filter.title === 'Scheduled') {

    return filter.tasks.filter((task) => task.isRecurring === false && task.startDate !== null)
  }else if(filter.title === 'For Adoption'){

    return filter.tasks.filter((task)=> task.assignedUserId === null)
  }

  return filter.tasks
}

function countTasksByFilter (tasks: TaskData[], count: 'Routine' | 'Someday' | 'Scheduled' | 'For Adoption'): number {
    return filterTasksByDefault({tasks, title: count}).length
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

const handleTaskDeletion = (taskId: number) => {
  if (userGroupStore.tasks && isGroupTasks.value) {
    userGroupStore.tasks = userGroupStore.tasks.filter((task) => task.id !== taskId)
  }
  if (userStore.tasks && !isGroupTasks.value) {
    userStore.tasks = userStore.tasks.filter((task) => task.id !== taskId)
  }
}
</script>
<template>
  <!-- <div v-for="task in tasks" :key="task.id">
    <br />
    <div>{{ task }}</div>
  </div> -->
  <!-- <div>is group: {{ isGroupTasks }}</div> -->
   <div>{{ countTasksByFilter(tasks, 'Routine') }}</div>
   <div>{{ countTasksByFilter(tasks, 'For Adoption') }}</div>
  <div class="flex justify-between">
    <div class="flex space-x-1">
      <div>
        <FwbButton @click="toggleTaskModal">add Task</FwbButton>
      </div>
    </div>
    <div>
      <div class="w-full">
        <FwbButton @click="toggleCategoryModal" class="w-full">add Category</FwbButton>
      </div>
      <!-- <div v-if="categories">
        <CategoryList :categories="categories" v-model:selected-category="selectedCategory" />
      </div> -->
    </div>
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
  <div class="flex justify-between">
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
    <div v-if="defaultCategories">
      <CategoryList
        :categories="defaultCategories"
        v-model:selected-category="selectedDefaultCategory"
      />
    </div>
  </div>
</template>

<style scoped></style>
