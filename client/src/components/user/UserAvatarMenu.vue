<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useUserStore } from '@/stores/userProfile'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import {
  FwbAvatar,
  FwbDropdown,
  FwbListGroup,
  FwbListGroupItem,
  FwbModal,
  FwbButton,
} from 'flowbite-vue'
import { trpc } from '@/trpc'
import { type UserPublic } from '@server/shared/types'

const { user } = defineProps<{
  user: UserPublic
}>()

const username = ref('')
const avatar = computed(()=> user.picture ? user.picture : undefined)
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
  logout({ logoutParams: { returnTo: window.location.origin } })
  authStore.logout()
  router.push({ name: 'Home' })
}

async function changeName() {
  try {
    userStore.updateUserName(username.value)
    username.value = ''
  } catch (error) {
    console.log(error)
  }
  closeModal()
}
</script>

<template>
  <div>
    <div>
      <FwbDropdown>
        <template #trigger>
          <span class="flex items-center hover:animate-pulse">
            <FwbAvatar :img="avatar" rounded size="lg" class="align-middle" />
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
        <div class="flex items-center text-lg">Terms of Service</div>
      </template>
      <template #body>
        <form v-on:submit.prevent="changeName">
          <input type="text" placeholder="name" v-model="username" />
          <button type="submit">submit</button>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <fwb-button @click="closeModal" color="green"> save changes </fwb-button>
        </div>
      </template>
    </FwbModal>
  </div>
</template>

<style scoped></style>
