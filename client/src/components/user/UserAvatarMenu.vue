<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '@/stores/userProfile'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import ConfirmationModal from '../ConfirmationModal.vue'
import UserSettingsModal from './UserSettingsModal.vue'
import {
  FwbAvatar,
  FwbDropdown,
  FwbListGroup,
  FwbListGroupItem,
} from 'flowbite-vue'
import { type UserPublic } from '@server/shared/types'

const { user } = defineProps<{
  user: UserPublic
}>()

const username = ref()
const isShowConfirmation = ref(false)
const isShowSettings = ref(false)
const avatar = computed(() => (user.picture ? user.picture : undefined))
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const { logout } = useAuth0()

const openUserSettings = ()=> {
  isShowSettings.value = !isShowSettings.value
}

function logoutUser() {
  authStore.logout()
  userStore.clearUser()
  router.push({ name: 'Home' })
}

const handleDeletion = async (value:boolean) => {
if (value){
  await deleteAccount()
}
isShowConfirmation.value = false
}

async function deleteAccount () {
logout()
await userStore.deleteUser()
}

onMounted(() => {
  username.value = user.username
})
</script>

<template>
  <div >
    <div>
      <FwbDropdown>
        <template #trigger>
          <span class="flex items-center hover:cursor-pointer">
            <FwbAvatar :img="avatar" rounded bordered size="lg" class="align-middle " />
            <span v-if="user.username" class="cursor-default p-2">{{ user.username }}</span>
          </span>
        </template>
        <FwbListGroup>
          <FwbListGroupItem hover>
            <button @click="openUserSettings" class="w-full">Settings</button>
          </FwbListGroupItem>
          <FwbListGroupItem hover class=" bg-slate-300">
            <button @click="logoutUser" class="w-full">Logout</button>
          </FwbListGroupItem>
        </FwbListGroup>
      </FwbDropdown>
    </div>
    <UserSettingsModal :user = user :show-user-settings="isShowSettings" @close="isShowSettings = false" />
  </div>
  <ConfirmationModal :action="'delete'" :object="user.username" :is-show-modal="isShowConfirmation" @delete="handleDeletion"/>
</template>

