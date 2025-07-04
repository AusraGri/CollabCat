<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { trpc } from '@/trpc'
import { useRouter } from 'vue-router'
import { FwbButton, FwbCarousel, FwbHeading, FwbAvatar } from 'flowbite-vue'
import { useAuthService } from '@/services/auth0'
import { useAuthStore, useInvitationStore } from '@/stores'
import { useUserStore } from '@/stores/userProfile'
import { useAuth0 } from '@auth0/auth0-vue'
import logo from '@/assets/collabCat.png'
import { stringToUrl } from '@/utils/helpers'
import pic1 from '@/assets/001.webp'
import pic2 from '@/assets/002.webp'
import pic3 from '@/assets/003.webp'
import AppDescription from '@/components/AppDescription.vue'

const pictures = [
  { src: pic1, alt: 'Image 1' },
  { src: pic2, alt: 'Image 2' },
  { src: pic3, alt: 'Image 3' },
]

const collabCatLogo = ref(logo)

const { getUserData } = useAuthService()
const authStore = useAuthStore()
const userStore = useUserStore()
const invitationStore = useInvitationStore()
const { loginWithRedirect, isAuthenticated, getAccessTokenSilently } = useAuth0()
const router = useRouter()
const join = async (hint: 'signup' | 'login') => {
  loginWithRedirect({
    appState: {
      target: '/',
    },
    authorizationParams: {
      prompt: 'login',
      screen_hint: hint,
    },
  })
}

const handleAuthRedirect = async () => {
  try {
    if (!isAuthenticated.value) {
      throw new Error('User is not authenticated yet.')
    }

    const idToken = await getAccessTokenSilently()

   await authStore.setAuthToken(idToken)
    let routeUsername: string
    const newUser = await getUserData()
    const signedUser = await trpc.user.signupAuth.mutate(newUser)
    userStore.user = { ...signedUser }

    if (invitationStore.invitationToken) {
      router.push({ name: 'Invite' })
      return
    }

    if (userStore.user?.username) {
      routeUsername = stringToUrl(userStore.user?.username)

      router.push({ name: 'PersonalCalendar', params: { username: routeUsername } })
    }
  } catch (error) {
    throw new Error(`Error handling Auth0 redirect callback: ${error}`)
  }
}

onMounted(async () => {
  if (isAuthenticated.value) {
    await handleAuthRedirect()
  } else {
    console.log('User not authenticated. Waiting for login...')
  }
})

watch(
  () => isAuthenticated.value,
  async (newValue) => {
    if (newValue) {
      await handleAuthRedirect()
    }
  }
)
</script>

<template>
  <div class="container mx-auto dark:bg-gray-800">
    <div class="m-7 flex flex-col items-center space-x-2 sm:flex-row">
      <FwbAvatar
        :img="collabCatLogo"
        rounded
        size="lg"
        bordered
        alt="CollabCat logo"
        aria-label="CollabCat logo"
      />
      <FwbHeading aria-label="CollabCat">CollabCat</FwbHeading>
      <span class="whitespace-nowrap" aria-live="polite"> Best way to share tasks!</span>
    </div>
    <div class="mt-1 space-x-2 p-3">
      <FwbButton
        @click="join('signup')"
        color="alternative"
        aria-label="Sign up for CollabCat"
        data-test="signup-button"
        >SignUp</FwbButton
      >
      <FwbButton
        @click="join('login')"
        color="alternative"
        aria-label="Log in to CollabCat"
        data-test="login-button"
        >Login</FwbButton
      >
    </div>
    <div class="w-full">
      <FwbCarousel
        :pictures="pictures"
        slide
        :slide-interval="5000"
        aria-live="polite"
        aria-label="Carousel of CollabCat images"
        data-test="collabcat-carousel"
      />
    </div>
    <div>
      <AppDescription />
    </div>
  </div>
</template>
