<script setup lang="ts">
import { trpc } from '@/trpc'
import { type UserPublic, type GroupsPublic } from '@server/shared/types'
import { FwbAvatar, FwbButton } from 'flowbite-vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthService } from '@/services/auth0'
import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '@/stores/authStore'
import { useInvitationStore } from '@/stores/invitationStore'
import { useUserStore } from '@/stores/userProfile'
import { stringToUrl } from '@/utils/helpers'

const { getToken, getUserData, signup, isAuth } = useAuthService()
const { loginWithRedirect, isAuthenticated, user, getAccessTokenSilently } = useAuth0()
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
  // await signup('/invite')

  loginWithRedirect({
    appState: {
      target: '/invite',
    },
    authorizationParams: {
      prompt: 'login',
      screen_hint: 'signup',
    },
  })
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
      console.log('validation')
      await validateInvitation()
    }

    await invitationStore.validateInvitationToken()
    await getInvitationDetails()

    if (isAuth && !userStore.user) {
      isTokenValid.value = true
      console.log('after authentication')
      const userData = await getUserData()

      const newUser = await trpc.user.signupAuth.mutate(userData)
      authStore.authToken = await getToken()
      userStore.user = newUser
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
  <div class="p-6 bg-white rounded-lg shadow-md">
    <div>
      <div v-if="!isAuth" class="text-center">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Welcome to CollabCat!</h1>
        <div class="text-lg text-gray-600 text-center">
          <div v-if="isTokenValid">
            <div class="flex flex-col sm:flex-row mb-1 items-center space-x-3 justify-center">
              <span class="inline-flex items-center">
                <FwbAvatar :img="groupOwner?.picture || undefined" rounded class="w-10 h-10 mr-2" />
                <span class="font-semibold">{{ groupOwner?.username }}</span>
              </span>
              <span>invited you</span>
            </div>
            <p class="mb-2">
              to join <span class="font-semibold text-gray-700">{{ groupInfo?.name }}</span>
            </p>
            <p class="mb-4">and start sharing tasks together!</p>
          </div>
          <p class="text-sm text-gray-500">If you want to join, please sign up to CollabCat</p>
          <div class="mt-6">
            <FwbButton @click="signupUser" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Signup
            </FwbButton>
          </div>
        </div>
        <p v-if="loading" class="mt-4 text-gray-500">Validating invitation...</p>
        <p v-else-if="error" class="mt-4 text-red-500">{{ error }}</p>
      </div>
  
      <div v-if="authStore.isLoggedIn" class="text-center">
        <h1 class="text-2xl font-bold text-green-600 mb-4">Welcome aboard!</h1>
        <p class="text-lg text-gray-600 mb-4">You have successfully joined the group!</p>
        <div class="mb-6">You can now go to your profile page</div>
        <div>
          <FwbButton @click="redirectToProfilePage" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            To Profile Page
          </FwbButton>
        </div>
      </div>
    </div>

    <div v-if="!isTokenValid" class="text-center text-red-600">
      <p>We are very sorry, but it looks like your invitation token has expired or is invalid.</p>
      <div class="mt-6">
        <FwbButton @click="redirectToHomePage" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
          Go to home page
        </FwbButton>
      </div>
    </div>
  </div>
</template>



<style scoped></style>
