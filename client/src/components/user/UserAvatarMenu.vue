<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  authStore.logout()
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
          <span
            class="flex items-center hover:cursor-pointer"
            role="button"
            tabindex="0"
            aria-label="User menu"
            data-test="user-menu-trigger"
          >
            <FwbAvatar
              :img="avatar"
              rounded
              bordered
              size="lg"
              class="align-middle"
              data-test="user-avatar"
              aria-label="Avatar Image"
            />
            <div class="flex h-full flex-col">
              <span
                v-if="user.username"
                class="ml-3 mt-5 cursor-default"
                aria-label="Username"
                data-test="user-name"
                >{{ user.username }}</span
              >
              <div class="ml-0 h-5">
                <Points
                  v-if="pointsStore.isPointsEnabled"
                  :points="pointsStore.userPoints"
                  data-test="user-points"
                />
              </div>
            </div>
          </span>
        </template>
        <FwbListGroup>
          <FwbListGroupItem hover>
            <button
              @click="openUserSettings"
              class="w-full"
              data-test="user-settings-button"
              aria-label="Open user settings"
            >
              Settings
            </button>
          </FwbListGroupItem>
          <FwbListGroupItem hover class="bg-slate-300">
            <button
              @click="logoutUser"
              class="w-full"
              data-test="logout-button"
              aria-label="Logout"
            >
              Logout
            </button>
          </FwbListGroupItem>
        </FwbListGroup>
      </FwbDropdown>
    </div>
    <UserSettingsModal
      :user="user"
      :show-user-settings="isShowSettings"
      @close="isShowSettings = false"
      data-test="user-settings-modal"
    />
  </div>
  <ConfirmationModal
    :action="'delete'"
    :object="user.username"
    :is-show-modal="isShowConfirmation"
    @delete="handleDeletion"
    data-test="confirmation-modal"
  />
</template>
