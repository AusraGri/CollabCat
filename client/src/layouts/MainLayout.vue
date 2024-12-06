<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import IntroPageLayout from './IntroPageLayout.vue'
import UserLayout from './UserLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

const { user } = useAuth0()

const userStore = useAuthStore()

const router = useRouter()
const { logout } = useAuth0()

const links = computed(() => [
  ...(userStore.isLoggedIn
    ? [{ label: 'Create New Task', name: 'WriteArticle' }]
    : [
        { label: 'Login', name: 'Login' },
        { label: 'Signup', name: 'Signup' },
      ]),
])

function logoutUser() {
  logout({ logoutParams: { returnTo: window.location.origin } })
  userStore.logout()
  router.push({ name: 'Login' })
}

</script>

<template>
  <UserLayout v-if="user" :user="user"></UserLayout>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink v-if="userStore.isLoggedIn" @click.prevent="logoutUser" link="#"
        >Logout</FwbNavbarLink
      >
    </template>
  </StackedLayout>
</template>
