
<script setup lang="ts">
import {ref} from 'vue'
import { useUserStore } from '@/stores/userProfile';
import { useAuthService } from '@/services/auth0';
import { useUserGroupsStore } from '../stores/userGroups';

const {isAuth} = useAuthService()
const userStore = useUserStore()
const userGroupStore = useUserGroupsStore()
const groupData = ref()

const getGroupData = async() => {
    groupData.value = await userGroupStore.fetchGroupData()
}

</script>
<template>
    <div>
this is Group page
<br>
<button @click="getGroupData" class=" bg-red-400">get data</button>
<br>
<div>{{ groupData }}</div>
<br>
<div>{{ userGroupStore.activeGroup }}</div>
<div>is loggedIn: {{ userStore.isLoggedIn }}</div>
<div>is auth service {{ isAuth }}</div>
<div>{{ userStore.user }}</div>
    </div>
</template>

<style scoped>

</style>