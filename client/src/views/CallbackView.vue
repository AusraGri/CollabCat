<template>
  <div>
    <p>Loading...</p>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'

const { isAuthenticated } = useAuth0()
const router = useRouter()

onMounted(async () => {
  try {
    if (isAuthenticated.value) {
      router.push({ name: 'PersonalCalendar' })
    } else {
      router.push({ name: 'Home' })
    }
  } catch (error) {
    console.error('Error during Auth0 redirect callback', error)
  }
})
</script>
