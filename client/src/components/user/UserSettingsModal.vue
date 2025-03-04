<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore, usePointsStore, useCategoriesStore } from '@/stores'
import { useAuthStore } from '@/stores/authStore'
import { useAuthService } from '@/services/auth0'
import { useRouter } from 'vue-router'
import ConfirmationModal from '../ConfirmationModal.vue'
import { FwbModal, FwbButton, FwbInput, FwbCheckbox } from 'flowbite-vue'
import { type UserPublic } from '@server/shared/types'
import CategoriesManager from '../categories/CategoriesManager.vue'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

const { showUserSettings, user } = defineProps<{
  user: UserPublic
  showUserSettings: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const { logout } = useAuthService()
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
  if (user.username === username.value) {
    emit('close')
    return
  }

  userStore.updateUserName(username.value)
  username.value = user.username
  router.push({ params: { username: username.value.replace(' ', '') } })

  emit('close')
}

const handleDeletion = async (value: boolean) => {
  if (value) {
    await deleteAccount()
  }
  isShowConfirmation.value = false
}

function logoutUser() {
  logout()
  authStore.logout()
  userStore.clearUser()
  router.push({ name: 'Home' })
}

async function deleteAccount() {
  await userStore.deleteUser()
  logoutUser()
}

const closeModal = () => {
  emit('close')
}

const saveUserSettings = async () => {
  await changeName()
  await handlePointsChange()
}

const handlePointsChange = async () => {
  if (isPoints.value === pointStore.isPointsEnabled) {
    return
  }
  if (isPoints.value) {
    await pointStore.enablePoints()

    return
  }
  await pointStore.disablePoints()
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
  <div data-test="user-settings-modal">
    <FwbModal v-if="showUserSettings" @close="closeModal" aria-modal="true" role="dialog">
      <template #header>
        <div class="flex items-center text-lg">User Settings</div>
      </template>
      <template #body>
        <div class="pb-2">
          <span class="mb-2 block cursor-default text-sm font-medium text-gray-900 dark:text-white">
            E-mail </span
          ><span
            class="block w-full cursor-default rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >{{ user.email }}
          </span>
        </div>
        <form id="userSettingsForm" v-on:submit.prevent="saveUserSettings">
          <div>
            <FwbInput
              id="username-input"
              type="text"
              placeholder="Username"
              v-model="username"
              label="Username"
              required
              :aria-label="username"
            >
            </FwbInput>
          </div>
          <div class="mt-3 w-fit">
            <FwbCheckbox label="Task Points" v-model="isPoints" aria-label="Task Points Checkbox" />
          </div>
        </form>
        <div v-if="userCategories.length > 0" class="mt-3 flex items-center border-t-2 pt-3">
          <FwbButton
            color="default"
            @click="openCategoryManager"
            outline
            pill
            square
            aria-label="Manage your categories"
          >
            Manage Your Categories
            <template #suffix>
              <ChevronRightIcon class="w-5" />
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
            <FwbButton
              color="red"
              @click="isShowConfirmation = true"
              aria-label="Delete your account"
              >Delete account</FwbButton
            >
          </div>
          <div>
            <FwbButton
              form="userSettingsForm"
              type="submit"
              color="green"
              aria-label="Save changes"
            >
              Save Changes
            </FwbButton>
          </div>
          <ConfirmationModal
            :action="'delete'"
            :object="user.username"
            :is-show-modal="isShowConfirmation"
            @confirmed="handleDeletion"
          />
        </div>
      </template>
    </FwbModal>
  </div>
</template>
