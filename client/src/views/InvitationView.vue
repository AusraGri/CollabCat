<script setup lang="ts">
import { trpc } from '@/trpc'
import { type UserPublic, type GroupsPublic } from '@server/shared/types'
import { FwbAvatar, FwbButton } from 'flowbite-vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthService } from '@/services/auth0'
import { useAuthStore } from '@/stores/authStore'
import { useInvitationStore } from '@/stores/invitationStore'
import { useUserStore } from '@/stores/userProfile'
import { stringToUrl } from '@/utils/helpers'

const { getToken, getUserData, isAuth, signup } = useAuthService()
const isTokenValid = ref(true)
const authStore = useAuthStore()
const userStore = useUserStore()
const invitationStore = useInvitationStore()
const router = useRouter()
const loading = ref(true)
const error = ref()
const groupInfo = ref<GroupsPublic>()
const groupOwner = ref<UserPublic>()

const signupUser = async () => {
  signup('/invite')
}

async function validateInvitation() {
  const token = router.currentRoute.value.query.token

  if (!token) {
    error.value = 'Invalid or missing token.'
    loading.value = false
    isTokenValid.value = false
    return
  }

  invitationStore.invitationToken = token as string

  try {
    await invitationStore.validateInvitationToken()
    isTokenValid.value = true
  } catch (err) {
    error.value = `Error occurred: ${err}`
    isTokenValid.value = false
    await invitationStore.deleteInvitation()
  } finally {
    loading.value = false
  }
}

async function getInvitationDetails() {
  try {
    groupInfo.value = await invitationStore.getGroupData()
    groupOwner.value = await invitationStore.getInviterData()
  } catch (err) {
    error.value = 'Error while retrieving invitation data'
    throw err
  }
}

async function addUserToGroup() {
  const groupId = invitationStore.groupData?.id

  if (!groupId) throw new Error('Group ID is missing.')

  try {
    await trpc.groups.addUserToGroup.mutate({ groupId })
  } catch (err) {
    error.value = 'Failed to add to group'
    throw err
  }
}

onMounted(async () => {
  loading.value = true
  try {
    if (!invitationStore.invitationToken && !isAuth) {
      await validateInvitation()
    }

    await invitationStore.validateInvitationToken()
    await getInvitationDetails()

    if (isAuth && !userStore.user) {
      isTokenValid.value = true
      const userData = await getUserData()

      const newUser = await trpc.user.signupAuth.mutate(userData)
      authStore.authToken = await getToken()
      userStore.user = newUser
      await addUserToGroup()
      await invitationStore.deleteInvitation()
    }

    if (isAuth && userStore.user) {
      await addUserToGroup()
      await invitationStore.deleteInvitation()
    }
  } catch (err) {
    error.value = `An error occurred: ${(err as Error).message}`
  } finally {
    loading.value = false
  }
})

const redirectToProfilePage = async () => {
  try {
    if (userStore.user && userStore.user.username) {
      router.push({ name: 'Profile', params: { username: stringToUrl(userStore.user?.username) } })
    }
  } catch (err) {
    error.value = `Failed to redirect: ${(err as Error).message}`
  }
}

const redirectToHomePage = () => {
  router.push({ name: 'Home' })
}
</script>
<template>
  <div class="rounded-lg bg-white p-6 shadow-md">
    <div>
      <!-- Invitation Block: Only visible if not authenticated -->
      <div v-if="!isAuth" class="text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-800" aria-live="polite">
          Welcome to CollabCat!
        </h1>
        <div class="text-center text-lg text-gray-600">
          <div v-if="isTokenValid">
            <div class="mb-1 flex flex-col items-center justify-center space-x-3 sm:flex-row">
              <span class="inline-flex items-center">
                <FwbAvatar
                  :img="groupOwner?.picture || undefined"
                  rounded
                  class="mr-2 h-10 w-10"
                  alt="Group Owner Avatar"
                />
                <span class="font-semibold">{{ groupOwner?.username }}</span>
              </span>
              <span>invited you</span>
            </div>
            <p class="mb-2">
              to join <span class="font-semibold text-gray-700">{{ groupInfo?.name }}</span>
            </p>
            <p class="mb-4">and start sharing tasks together!</p>
          </div>
          <p class="text-sm text-gray-500" aria-live="polite">
            If you want to join, please sign up to CollabCat
          </p>
          <div class="mt-6">
            <FwbButton
              @click="signupUser"
              class="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              aria-label="Sign up to CollabCat"
              data-test="signup-button"
            >
              Signup
            </FwbButton>
          </div>
        </div>
        <p v-if="loading" class="mt-4 text-gray-500" aria-live="assertive">
          Validating invitation...
        </p>
        <p v-else-if="error" class="mt-4 text-red-500" role="alert">{{ error }}</p>
      </div>

      <!-- Authenticated Block: Only visible if user is logged in -->

      <div v-if="authStore.isLoggedIn" class="text-center">
        <h1 class="mb-4 text-2xl font-bold text-green-600" aria-live="polite">Welcome aboard!</h1>
        <p class="mb-4 text-lg text-gray-600">You have successfully joined the group!</p>
        <div class="mb-6" aria-live="polite">You can now go to your profile page</div>
        <div>
          <FwbButton
            @click="redirectToProfilePage"
            class="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
            aria-label="Go to profile page"
            data-test="profile-button"
          >
            To Profile Page
          </FwbButton>
        </div>
      </div>
    </div>

    <div v-if="!isTokenValid" class="text-center text-red-600" aria-live="assertive">
      <p>We are very sorry, but it looks like your invitation token has expired or is invalid.</p>
      <div class="mt-6">
        <FwbButton
          @click="redirectToHomePage"
          class="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          aria-label="Go to home page"
          data-test="home-button"
        >
          Go to home page
        </FwbButton>
      </div>
    </div>
  </div>
</template>
