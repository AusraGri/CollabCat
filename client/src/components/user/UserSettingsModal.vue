<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userProfile'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import ConfirmationModal from '../ConfirmationModal.vue'
import { FwbModal, FwbButton, FwbInput } from 'flowbite-vue'
import { type UserPublic } from '@server/shared/types'

const { showUserSettings, user } = defineProps<{
  user: UserPublic
  showUserSettings: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const username = ref()
const isShowConfirmation = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

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
        <form id="userSettingsForm" v-on:submit.prevent="changeName">
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
        </form>
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
