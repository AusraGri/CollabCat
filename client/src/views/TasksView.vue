
<script setup lang="ts">
import TaskCard from '@/components/TaskCard.vue';
import { type TasksDue } from '@server/shared/types';

const task = {
    title: 'title',
    points: 23,
    importance: 'High',
    assignedUserId: 1,
} as Partial<TasksDue>

</script>
<template>
    <div>
<TaskCard :task="task"></TaskCard>
    </div>
</template>

<style scoped>

</style>