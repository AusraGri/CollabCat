<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '@/stores/userProfile'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import ConfirmationModal from '../ConfirmationModal.vue'
import {
  FwbAvatar,
  FwbDropdown,
  FwbListGroup,
  FwbListGroupItem,
  FwbModal,
  FwbButton,
  FwbInput,
} from 'flowbite-vue'
import { type UserPublic } from '@server/shared/types'

const { user } = defineProps<{
  user: UserPublic
}>()

const username = ref()
const isShowConfirmation = ref(false)
const avatar = computed(() => (user.picture ? user.picture : undefined))
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const { logout } = useAuth0()

const showUserMenu = ref(false)
const openUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}
function closeModal() {
  showUserMenu.value = false
}

function logoutUser() {
  logout()
  authStore.logout()
  router.push({ name: 'Home' })
}

async function changeName() {
  try {
    userStore.updateUserName(username.value)
    username.value = user.username
  } catch (error) {
    console.log(error)
  }
  closeModal()
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
          <span class="flex items-center hover:animate-pulse">
            <FwbAvatar :img="avatar" rounded bordered size="lg" class="align-middle " />
            <span v-if="user.username" class="cursor-default p-2">{{ user.username }}</span>
          </span>
        </template>
        <FwbListGroup>
          <FwbListGroupItem hover>
            <button @click="openUserMenu" class="w-full">Settings</button>
          </FwbListGroupItem>
          <FwbListGroupItem hover>
            <button @click="logoutUser" class="w-full">Logout</button>
          </FwbListGroupItem>
        </FwbListGroup>
      </FwbDropdown>
    </div>
    <FwbModal v-if="showUserMenu" @close="closeModal">
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
  <ConfirmationModal :action="'delete'" :object="user.username" :is-show-modal="isShowConfirmation" @delete="handleDeletion"/>
</template>

<style scoped></style>
