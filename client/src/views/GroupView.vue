
<script setup lang="ts">
import { useUserStore } from '@/stores/userProfile';
import { useAuthService } from '@/services/auth0';

const {isAuth} = useAuthService()
const userStore = useUserStore()

</script>
<template>
    <div>
this is Group page
<div>is loggedIn: {{ userStore.isLoggedIn }}</div>
<div>is auth service {{ isAuth }}</div>
<div>{{ userStore.user }}</div>
    </div>
</template>

<style scoped>

</style>