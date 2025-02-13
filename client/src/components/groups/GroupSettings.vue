<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserGroupsStore, usePointsStore, useCategoriesStore } from '@/stores'
import { FwbCheckbox, FwbModal, FwbButton } from 'flowbite-vue'
import ConfirmationModal from '../ConfirmationModal.vue'
import { useRouter } from 'vue-router'
import CategoriesManager from '../categories/CategoriesManager.vue'

const { isShowModal } = defineProps<{
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (event: 'create:group', value: string): void
  (event: 'close'): void
}>()

const router = useRouter()
const userGroupStore = useUserGroupsStore()
const categoryStory = useCategoriesStore()
const pointStore = usePointsStore()
const isPointsEnabled = ref(pointStore.isPointsEnabled)
const isShowConfirmation = ref(false)
const isManageCategories = ref(false)
const isAdmin = computed(() => userGroupStore.isAdmin)
const categories = computed(() => {
  const groupCategories =
    categoryStory.groupCategories.filter((cat) => cat.isDefault === false) || []

  if (isAdmin.value) return groupCategories

  return (
    groupCategories.filter((cat) => cat.createdByUserId === userGroupStore.userMembership?.id) || []
  )
})

const removeText = computed(() => {
  if (isAdmin.value) return 'Delete'

  return 'Leave'
})

const closeModal = () => {
  emit('close')
}

const handlePointChange = async () => {
  const groupId = userGroupStore.activeGroup?.id
  try {
    if (isPointsEnabled.value === pointStore.isPointsEnabled) return

    if (!groupId) throw new Error('Missing data for points managing')

    if (isPointsEnabled.value) {
      pointStore.enablePoints(groupId)
    } else {
      pointStore.disablePoints()
    }
  } catch (error) {
    console.log(error)
  }
}

const saveChanges = async () => {
  try {
    await handlePointChange()
  } catch (error) {
    console.log(error)
  }
  emit('close')
}

const processConfirmation = async (confirm: boolean) => {
  isShowConfirmation.value = false

  if (!confirm) return

  try {
    if (confirm && isAdmin.value) {
      await userGroupStore.deleteGroup()
    } else if (confirm && !isAdmin.value) {
      await userGroupStore.removeUserFromGroup()
    }
    userGroupStore.activeGroup = null
    userGroupStore.fetchUserGroups()
    emit('close')
    router.push({ name: 'Profile' })
  } catch (error) {
    console.log(error)
  }
}

watch(
  () => pointStore.isEnabled,
  (newValue) => {
    isPointsEnabled.value = newValue
  }
)
</script>

<template>
  <div>
    <FwbModal v-if="isShowModal" @close="closeModal">
      <template #header>
        <div>Manage {{ userGroupStore.activeGroup?.name }}</div>
      </template>
      <template #body>
        <div class="w-fit">
          <FwbCheckbox v-model="isPointsEnabled" label="My Group Task Points" />
        </div>
        <div v-if="categories.length" class="mt-5">
          <FwbButton color="default" @click="isManageCategories = true" outline pill square>
            Manage Your Categories
            <template #suffix>
              <svg
                class="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  fill-rule="evenodd"
                />
              </svg>
            </template>
          </FwbButton>
          <CategoriesManager
            :categories="categories"
            :is-show-categories="isManageCategories"
            @close="isManageCategories = false"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between">
          <div>
            <FwbButton color="red" @click="isShowConfirmation = true"
              >{{ removeText }} this Group</FwbButton
            >
          </div>
          <div>
            <fwb-button form="userSettingsForm" color="green" @click="saveChanges">
              Save Changes
            </fwb-button>
          </div>
        </div>
      </template>
    </FwbModal>
    <ConfirmationModal
      :action="removeText.toLowerCase()"
      :object="userGroupStore.activeGroup?.name"
      :is-show-modal="isShowConfirmation"
      @confirmed="processConfirmation"
    />
  </div>
</template>
<style scoped></style>
