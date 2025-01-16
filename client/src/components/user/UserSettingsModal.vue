<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { trpc } from '@/trpc'
import { useUserStore } from '@/stores/userProfile'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import ConfirmationModal from '../ConfirmationModal.vue'
import { FwbModal, FwbButton, FwbInput, FwbCheckbox } from 'flowbite-vue'
import { type UserPublic } from '@server/shared/types'

const { showUserSettings, user } = defineProps<{
  user: UserPublic
  showUserSettings: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const authStore = useAuthStore()
const userStore = useUserStore()
const username = ref()
const isPoints = ref(userStore.isPointsEnabled)
const isShowConfirmation = ref(false)
const router = useRouter()

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
    console.log(error) // change to toast
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
    if (isPoints.value === userStore.isPointsEnabled) {
      return
    }
    if (isPoints.value) {
      await trpc.points.createPersonalPoints.mutate()
      userStore.isPointsEnabled = true
      return
    }
    await trpc.points.deletePoints.mutate({})
    userStore.isPointsEnabled = false
  } catch (error) {
    console.log('Failed to change point status', error)
  }
}

onMounted(() => {
  username.value = user.username
})
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
          <div class="mt-3">
            <FwbCheckbox label="Task Points" v-model="isPoints" />
          </div>
        </form>
        <div class="flex mt-3 border-t-2 items-center pt-3">
          <FwbButton color="default" outline pill square>
            Manage Your Groups
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
