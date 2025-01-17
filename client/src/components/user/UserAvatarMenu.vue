<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore, usePointsStore } from '@/stores'
import { useAuthStore } from '@/stores/authStore'
import { useAuthService } from '@/services/auth0'
import { useRouter } from 'vue-router'
import ConfirmationModal from '../ConfirmationModal.vue'
import UserSettingsModal from './UserSettingsModal.vue'
import { FwbAvatar, FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue'
import { type UserPublic } from '@server/shared/types'
import Points from '../points/Points.vue'

const { user } = defineProps<{
  user: UserPublic
}>()

const username = ref()
const pointsStore = usePointsStore()
const isShowConfirmation = ref(false)
const isShowSettings = ref(false)
const avatar = computed(() => (user.picture ? user.picture : undefined))
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
// const { logout } = useAuth0()

const { logout } = useAuthService()

const openUserSettings = () => {
  isShowSettings.value = !isShowSettings.value
}

function logoutUser() {
  logout()
  authStore.logout()
  userStore.clearUser()
  router.push({ name: 'Home' })
}

const handleDeletion = async (value: boolean) => {
  if (value) {
    await deleteAccount()
  }
  isShowConfirmation.value = false
}

async function deleteAccount() {
  logout()
  await userStore.deleteUser()
}

onMounted(() => {
  username.value = user.username
})
</script>

<template>
  <div>
    <div>
      <FwbDropdown>
        <template #trigger>
          <span class="flex items-center hover:cursor-pointer">
            <FwbAvatar :img="avatar" rounded bordered size="lg" class="align-middle" />
            <div class="flex flex-col h-full">
              <span v-if="user.username" class="cursor-default mt-5 ml-3 ">{{ user.username }}</span>
              <div class=" h-5 ml-0">
                <Points v-if="pointsStore.isPointsEnabled" :points="pointsStore.userPoints" />
              </div>
            </div>
          </span>
        </template>
        <FwbListGroup>
          <FwbListGroupItem hover>
            <button @click="openUserSettings" class="w-full">Settings</button>
          </FwbListGroupItem>
          <FwbListGroupItem hover class="bg-slate-300">
            <button @click="logoutUser" class="w-full">Logout</button>
          </FwbListGroupItem>
        </FwbListGroup>
      </FwbDropdown>
    </div>
    <UserSettingsModal
      :user="user"
      :show-user-settings="isShowSettings"
      @close="isShowSettings = false"
    />
  </div>
  <ConfirmationModal
    :action="'delete'"
    :object="user.username"
    :is-show-modal="isShowConfirmation"
    @delete="handleDeletion"
  />
</template>
