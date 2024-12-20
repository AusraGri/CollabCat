
<script setup lang="ts">
import {ref} from 'vue'

const task = ref({
    title: 'title',
    points: 23,
    importance: 'High',
    assignedUserId: 1,
})

</script>
<template>
    <div>
Task view {{ task }}
    </div>
</template>

<style scoped>

</style>