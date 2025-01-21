<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.push({ name: 'Home' })
})
</script>

<template>
  <div>Successfully logged out</div>
</template>
