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

const {getToken, getUserData, signup, isAuth} = useAuthService()
const { loginWithRedirect, isAuthenticated, user } = useAuth0()
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
  await signup('/invite')

  // loginWithRedirect({
  //   appState: {
  //     target: '/invite',
  //   },
  //   authorizationParams: {
  //     prompt: 'login',
  //     screen_hint: 'signup',
  //   },
  // })
}

async function validateInvitation() {
  const token = router.currentRoute.value.query.token

  if (!token) {
    error.value = 'Invalid or missing token.'
    loading.value = false
    return
  }

  invitationStore.invitationToken = token as string

  try {
    await invitationStore.validateInvitationToken()
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
      console.log("after authentication")
      const userData = await getUserData()
      const newUser = await trpc.user.signupAuth.mutate(userData)
      authStore.authToken = await getToken()
      userStore.user = newUser
      await addUserToGroup()
    }
  } catch (err) {
    error.value = `An error occurred: ${(err as Error).message}`
  } finally {
    loading.value = false
  }
})

const redirectToProfilePage = async () => {
  try {
    await invitationStore.deleteInvitation()
    router.push({ name: 'Profile', params: { username: userStore.user?.username } })
  } catch (err) {
    error.value = `Failed to redirect: ${(err as Error).message}`
  }
}

const redirectToHomePage = ()=> {
  router.push({ name: 'Home' })
}
</script>
<template>
  <div>{{ isAuthenticated }}</div>
  <div>isAuth: {{ isAuth }}</div>
  <div v-if="!isAuth">
    <h1>Welcome to the CollabCat!</h1>
    <div>
      <p>
        Owr dear member
        <span>
          <FwbAvatar :img="groupOwner?.picture || undefined" rounded />
          {{ groupOwner?.username }}
        </span>
        invited you
      </p>
      <p>
        to join group: <span>{{ groupInfo?.name }}</span>
      </p>
      <p>and start sharing tasks together!</p>
      <br />
      <p>If you want to join, please sign up to CollabCat</p>
      <div>
        <FwbButton @click="signupUser">Signup</FwbButton>
      </div>
    </div>
    <p v-if="loading">Validating invitation...</p>
    <p v-else-if="error">{{ error }}</p>
  </div>
  <div v-if="authStore.isLoggedIn">
    <h1>Welcome aboard!</h1>
    <p>You have successfully joined the group!</p>
    <div>You can now go to your profile page</div>
    <div>
      <FwbButton @click="redirectToProfilePage">To Profile Page</FwbButton>
    </div>
  </div>
  <div v-else>
We are very sorry, but looks like your invitation token has expired or is invalid.
<FwbButton @click="redirectToHomePage">Go to home page</FwbButton>
  </div>
</template>

<style scoped></style>
