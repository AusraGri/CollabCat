
<script setup lang="ts">
import UserLayout from './UserLayout.vue';
import GroupLayout from './GroupLayout.vue';

</script>

<template>
    <UserLayout>
        <template #group>
            <GroupLayout />
        </template>
    </UserLayout>
</template>
<style scoped>

</style>