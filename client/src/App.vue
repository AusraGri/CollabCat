<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalAlertError from './components/GlobalAlertError.vue'
</script>

<template>
  <div>
    <GlobalAlertError />
    <RouterView />
  </div>
</template>
