<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { trpc } from '@/trpc'
import { useRouter } from 'vue-router'
import { FwbButton, FwbCarousel } from 'flowbite-vue'
import { useAuthService } from '@/services/auth0'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userProfile'
import { useAuth0 } from '@auth0/auth0-vue'


const pictures = [
  { src: '../assets/intro/01.jpeg', alt: 'Image 1' },
  { src: '../assets/intro/02.jpg', alt: 'Image 2' },
  { src: '../assets/intro/03.jpg', alt: 'Image 3' },
]

// import useErrorMessage from '@/composables/useErrorMessage'
const { getUserData } = useAuthService()
const authStore = useAuthStore()
const userStore = useUserStore()
const { loginWithRedirect, isAuthenticated, user, getAccessTokenSilently } = useAuth0()
const router = useRouter()
const users = ref()
const signup = async () => {
  loginWithRedirect({
    appState: {
      target: '/', // Where to redirect after successful login
    },
    authorizationParams: {
      prompt: 'login', // Forces the login form to appear
      screen_hint: 'signup', // Forces the signup screen to appear
    },
  })
}

const handleAuthRedirect = async () => {
  try {
    if (!isAuthenticated) {
      console.log('User is not authenticated yet.')
      return
    }

    const idToken = await getAccessTokenSilently()

    authStore.setAuthToken(idToken)
    let routeUsername: string
    try {
      const newUser = await getUserData()
      const signedUser = await trpc.user.signupAuth.mutate(newUser)
      userStore.user = { ...signedUser }
    } catch (error) {
      console.log(error)
    }

    if (userStore.user?.username) {
      routeUsername = userStore.user?.username?.replace(' ', '')

      router.push({ name: 'PersonalCalendar', params: { username: routeUsername } })
    }
  } catch (error) {
    console.error('Error handling Auth0 redirect callback:', error)
  }
}

onMounted(async () => {
  try {
    if (isAuthenticated) {
      // Handle post-authentication actions if already authenticated
      await handleAuthRedirect()
    } else {
      console.log('User not authenticated. Waiting for login...')
    }
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})
</script>

<template>
  <div class="dark:bg-gray-800">
    <FwbCarousel :pictures="pictures" />
    <Carousel />
    <div>isAuth: {{ isAuthenticated }}</div>
    <div v-if="isAuthenticated">authorized {{ user?.email }}</div>
    <div v-if="!isAuthenticated">not authorized</div>
    <div>This is Home page view</div>
    <div>
      is user logged in by user store: {{ userStore.isLoggedIn }} {{ userStore.user?.email }}
    </div>
    <div>{{ user }}</div>
    <div v-for="user in users" :key="user">{{ user }}</div>
    <div v-if="!userStore.isLoggedIn" class="rounded-md bg-white px-6 py-8">
      <div class="items-center lg:flex">
        <div class="lg:w-1/2">
          <h2 class="text-4xl font-bold text-gray-800 dark:text-gray-100">API test platform</h2>
          <p class="mt-4 text-gray-500 dark:text-gray-400 lg:max-w-md">
            Hi! To begin the test, please sign up and then login.
          </p>
          <div class="mt-6 flex items-center gap-2">
            <FwbButton @click="signup">Sign up</FwbButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
