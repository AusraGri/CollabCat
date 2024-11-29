<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { trpc } from '@/trpc'
import { useRouter } from 'vue-router'
import { FwbButton } from 'flowbite-vue'
import { useAuthStore } from '@/stores/user'
import { useAuth0 } from '@auth0/auth0-vue'
// import useErrorMessage from '@/composables/useErrorMessage'
const userStore = useAuthStore()
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

const getUsers = async () => {
  users.value = await trpc.user.getUsers.query()
}

const handleAuthRedirect = async () => {
  try {
    // Check if the user is authenticated after the redirect
    if (!isAuthenticated.value) {
      console.log('User is not authenticated yet.')
      return
    }

    const idToken = await getAccessTokenSilently() // The ID token (JWT)

    // Optionally store the token in localStorage or a state management library (like Vuex or Pinia)
    userStore.setAuthToken(idToken)
    try {
      if (user.value?.email && user.value?.name && user.value.picture) {
        await trpc.user.signupAuth.mutate({
          auth0Token: idToken,
          email: user.value.email,
          username: user.value.name,
          picture: user.value.picture
        })
      }
    } catch (error) {
      console.log(error)
    }
    // Send the user data to your backend to store the user in the database
    await getUsers()
    // After saving the user, redirect to the profile page or another page
    router.push({ name: 'Home' }) // Redirect to the profile page after signup
  } catch (error) {
    console.error('Error handling Auth0 redirect callback:', error)
  }
}

onMounted(async () => {
  try {
    if (isAuthenticated.value) {
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
    <div v-if="isAuthenticated">authorized</div>
    <div v-if="!isAuthenticated">not authorized</div>
    <div>This is Home page view</div>
    <div>{{ userStore.isLoggedIn }}</div>
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
