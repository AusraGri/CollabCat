<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore, usePointsStore, useCategoriesStore } from '@/stores'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import ConfirmationModal from '../ConfirmationModal.vue'
import { FwbModal, FwbButton, FwbInput, FwbCheckbox } from 'flowbite-vue'
import { type UserPublic } from '@server/shared/types'
import CategoriesManager from '../categories/CategoriesManager.vue'

const { showUserSettings, user } = defineProps<{
  user: UserPublic
  showUserSettings: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const authStore = useAuthStore()
const userStore = useUserStore()
const pointStore = usePointsStore()
const categoryStore = useCategoriesStore()
const username = ref()
const isPoints = ref(pointStore.isEnabled)
const isShowConfirmation = ref(false)
const isShowCategoriesManager = ref(false)
const router = useRouter()
const userCategories = computed(() => categoryStore.userCategories || [])

async function changeName() {
  try {
    if (user.username === username.value) {
      emit('close')
      return
    }

    userStore.updateUserName(username.value)
    username.value = user.username
    router.push({ params: { username: username.value.replace(' ', '') } })
  } catch (error) {
    console.log(error)
  }
  emit('close')
}

const handleDeletion = async (value: boolean) => {
  if (value) {
    await deleteAccount()
  }
  isShowConfirmation.value = false
}

async function deleteAccount() {
  await userStore.deleteUser()
  authStore.logout()
  router.push({ name: 'Home' })
}

const closeModal = () => {
  emit('close')
}

const saveUserSettings = async () => {
  await changeName()
  await handlePointsChange()
}

const handlePointsChange = async () => {
  try {
    if (isPoints.value === pointStore.isPointsEnabled) {
      return
    }
    if (isPoints.value) {
      await pointStore.enablePoints()

      return
    }
    await pointStore.disablePoints()
  } catch (error) {
    console.log('Failed to change point status', error)
  }
}

onMounted(() => {
  username.value = user.username
})

const openCategoryManager = () => {
  isShowCategoriesManager.value = true
}

watch(
  () => pointStore.isEnabled,
  (newValue) => {
    isPoints.value = newValue
  }
)
</script>

<template>
  <div>
    <FwbModal v-if="showUserSettings" @close="closeModal">
      <template #header>
        <div class="flex items-center text-lg">User Settings</div>
      </template>
      <template #body>
        <form id="userSettingsForm" v-on:submit.prevent="saveUserSettings">
          <div>
            <FwbInput
              type="text"
              placeholder="Username"
              v-model="username"
              label="Username"
              required
            >
            </FwbInput>
          </div>
          <div class="mt-3 w-fit">
            <FwbCheckbox label="Task Points" v-model="isPoints" />
          </div>
        </form>
        <div v-if="userCategories.length > 0" class="mt-3 flex items-center border-t-2 pt-3">
          <FwbButton color="default" @click="openCategoryManager" outline pill square>
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
            :is-show-categories="isShowCategoriesManager"
            :categories="userCategories"
            @close="isShowCategoriesManager = false"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between">
          <div>
            <FwbButton color="red" @click="isShowConfirmation = true">Delete account</FwbButton>
          </div>
          <div>
            <fwb-button form="userSettingsForm" type="submit" color="green">
              Save Changes
            </fwb-button>
          </div>
        </div>
      </template>
    </FwbModal>
  </div>
  <ConfirmationModal
    :action="'delete'"
    :object="user.username"
    :is-show-modal="isShowConfirmation"
    @delete="handleDeletion"
  />
</template>

<style scoped></style>
