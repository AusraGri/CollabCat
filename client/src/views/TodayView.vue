<script setup lang="ts">
import {onMounted, ref, computed} from 'vue'
import { useTasksStore } from '@/stores/taskStore';
import TaskCard from '@/components/task/TaskCard.vue';

const taskStore = useTasksStore()

const today = ref(new Date().toISOString().split('T')[0])
const dueTasks = ref()
const isLoading = ref(true)

const tasks = computed(()=> dueTasks.value)

const getDueTasks = async () => {
    try {
        const tasks =  await taskStore.getDueTasks(today.value)
        return tasks
        
    } catch (error) {
        console.log(error)
    }

}
onMounted(async()=>{
 dueTasks.value = await getDueTasks()
 console.log(dueTasks.value)
})
</script>

<template>
    <div>
{{ today }}
    </div>
    <div>
tasks: {{ tasks }}
    </div>
    <div v-for="task in tasks" :key="task">
<TaskCard :task="task" /> 
    </div>
</template>
