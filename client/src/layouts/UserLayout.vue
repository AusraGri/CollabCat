<script setup lang="ts">
import { ref } from 'vue'
import { FwbAvatar, FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem, FwbModal } from 'flowbite-vue'
import { User } from '@auth0/auth0-vue'
import UserAvatarMenu from '@/components/user/UserAvatarMenu.vue'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/userProfile'

const userStore = useUserStore()
const showUserMenu = ref(false)
const openUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}
function closeModal () {
  showUserMenu.value = false
}
</script>

<template>
  <div v-if="userStore.user" class="flex items-center justify-between p-3">
    <UserAvatarMenu :user="userStore.user" />
    <FwbDropdown close-inside>
      <div class="w-52">
        <p class="p-2">Dropdown content line one</p>
        <p class="p-2">Dropdown content line two</p>
        <p class="p-2">Dropdown content line three</p>
        <p class="p-2">Dropdown content line four</p>
      </div>
    </FwbDropdown>
    <FwbButton pill size="sm" class="h-10 w-10">S</FwbButton>
  </div>
  <main>user main RouterView</main>
</template>
<style scoped></style>
