<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'

const { loginWithRedirect } = useAuth0()

const login = () => {
  loginWithRedirect()
}
</script>

<template>
  <div>
    <button @click="login">Sign up</button>
  </div>
</template>
