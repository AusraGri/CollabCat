<script setup lang="ts">
import { ref, computed } from 'vue'
import { FwbButton, FwbListGroup, FwbListGroupItem  } from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import { useUserStore } from '@/stores/userProfile'
import CreateTask from '../components/task/CreateTask.vue'
import CreateCategory from '@/components/categories/CreateCategory.vue'
import type { CategoriesPublic } from '@server/shared/types'
import CategoryList from '@/components/categories/CategoryList.vue'
import TaskCard from '@/components/task/TaskCard.vue'

const userGroupStore = useUserGroupsStore()
const userStore = useUserStore()

const isNewTask = ref(false)
const isNewCategory = ref(false)
const selectedCategory = ref(null)
const groupId = computed(() => userGroupStore.activeGroup?.id)
const members = computed(() => userGroupStore.groupMembers || undefined)
const categories = computed(() => {
  if (groupId.value) {
    return userGroupStore.categories || undefined
  }
  return userStore.categories || undefined
})

const groupTasks = computed(()=> userGroupStore.tasks)

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


</script>
<template>
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
      <div v-if="categories">
        <CategoryList :categories="categories" :selected-category="selectedCategory" />
      </div>
    </div>
    <CreateTask
      :is-show-modal="isNewTask"
      :group-id="groupId"
      :group-members="members"
      :categories="categories"
      @close="toggleTaskModal"
    />
    <CreateCategory
      :is-show-modal="isNewCategory"
      :group-id="groupId"
      @create:category="handleNewCategory"
      @close="toggleCategoryModal"
    />
  </div>
  <div v-if="groupId">
<div v-for="task in groupTasks" :key="task.id">
  <TaskCard :task="task" :categories="categories" :group-members="members" />
</div>
  </div>
</template>

<style scoped></style>
