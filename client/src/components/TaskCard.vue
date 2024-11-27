<script setup lang="ts">
import { FwbBadge, FwbCheckbox, FwbAvatar } from 'flowbite-vue'
import { ref } from 'vue'
const check = ref(false)
</script>

<template>
  <div class="flex space-x-1 items-center bg-slate-600 p-5 rounded">
    <div class="h-6">
        <FwbCheckbox v-model="check" />
    </div>
    <div class="flex flex-col items-center w-60">
        <div class=" bg-green-600 rounded w-full flex p-1 justify-between">
            <div class=" p-1">task</div>
            <div class=" bg-green-400 rounded h-full p-1">importance</div>
        </div>
        <div class=" bg-orange-300 rounded w-full flex justify-between p-1">
            <div class=" p-1">date</div>
            <div class=" bg-red-400 p-1 rounded">days left</div>
        </div>
        <div class=" bg-orange-100 rounded w-full flex p-1">
            <FwbAvatar image="../assets/illustration.png" rounded size="sm"/>
        </div>
    </div>
    <div class="self-start">
        <FwbBadge size="sm" class=" h-full">Points</FwbBadge>
    </div>
  </div>
</template>
<style scoped></style>
