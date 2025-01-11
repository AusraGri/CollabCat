
<script setup lang="ts">
import {ref} from 'vue'
import { FwbHeading } from 'flowbite-vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userProfile';
import { useUserGroupsStore } from '../stores/userGroups';

const route = useRoute()
const userStore = useUserStore()
const userGroupStore = useUserGroupsStore()
const groupData = ref()

const getGroupData = async() => {
    groupData.value = await userGroupStore.fetchGroupData()
}

</script>
<template>
    <div>
        <div>
            <FwbHeading> Today</FwbHeading>
        </div>
this is Group page
<br>
<button @click="getGroupData" class=" bg-red-400">get data</button>
<br>
<div>{{ groupData }}</div>
<br>
    </div>
    <div>
        {{ route.fullPath }}
    </div>
</template>

<style scoped>

</style>