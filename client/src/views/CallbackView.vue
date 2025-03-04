<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import { useAuthService } from '@/services/auth0'
import { useAuthStore, useUserStore, useInvitationStore } from '@/stores'

const { getUserData } = useAuthService()
const authStore = useAuthStore()
const userStore = useUserStore()
const invitationStore = useInvitationStore()
const { isAuthenticated, getAccessTokenSilently } = useAuth0()
const router = useRouter()

const handleAuthRedirect = async () => {
  try {
    if (!isAuthenticated.value) {
      throw new Error('User is not authenticated yet.')
    }

    const idToken = await getAccessTokenSilently()

    authStore.setAuthToken(idToken)
    let routeUsername: string

    const newUser = await getUserData()
    const signedUser = await trpc.user.signupAuth.mutate(newUser)
    userStore.user = { ...signedUser }

    if (userStore.user?.username) {
      routeUsername = userStore.user?.username?.replace(' ', '')

      router.push({ name: 'PersonalCalendar', params: { username: routeUsername } })
    }
  } catch (error) {
    throw new Error(`Error handling Auth0 redirect callback: ${error}`)
  }
}

onMounted(async () => {
  try {
    if (isAuthenticated.value && !invitationStore.invitationToken) {
      await handleAuthRedirect()
    } else if (isAuthenticated.value && invitationStore.invitationToken) {
      router.push({ name: 'Invite' })
    } else {
      router.push({ name: 'Home' })
    }
  } catch (error) {
    throw new Error('Error during Auth0 redirect callback')
  }
})
</script>
<template>
  <div>
    <p>Loading...</p>
  </div>
</template>
