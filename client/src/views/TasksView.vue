<script setup lang="ts">
import { ref, computed } from 'vue'
import { FwbButton } from 'flowbite-vue'
import { useUserGroupsStore } from '@/stores/userGroups'
import { useUserStore } from '@/stores/userProfile'
import CreateTask from '../components/task/CreateTask.vue'
import CreateCategory from '@/components/categories/CreateCategory.vue'
import type { CategoriesPublic } from '@server/shared/types'
import CategorySelect from '@/components/categories/CategorySelect.vue'

const userGroupStore = useUserGroupsStore()
const userStore = useUserStore()
const isNewTask = ref(false)
const isNewCategory = ref(false)
const groupId = computed(()=> userGroupStore.activeGroup?.id)
const members = computed(()=> userGroupStore.groupMembers || undefined)
const categories = computed(()=> {
    if(groupId.value){
        return userGroupStore.categories || undefined
    }
    return userStore.categories || undefined
})

const task = ref({
  title: 'title',
  points: 23,
  importance: 'High',
  assignedUserId: 1,
})

const handleNewCategory = (category: CategoriesPublic) => {
    if(category.groupId){
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
  <div>
    <div>
      <FwbButton @click="toggleTaskModal">add Task</FwbButton>
    </div>
    <div>
      <FwbButton @click="toggleCategoryModal">add Category</FwbButton>
    </div>
    <div v-if="categories">
        <CategorySelect :categories="categories" />
    </div>
    <CreateTask :is-show-modal="isNewTask" :group-id="groupId" :group-members="members" :categories="categories" @close="toggleTaskModal"  />
    <CreateCategory :is-show-modal="isNewCategory" :group-id="groupId" @create:category="handleNewCategory" @close="toggleCategoryModal"/>
  </div>
</template>

<style scoped></style>
