<script lang="ts" setup>
import { FwbAlert } from 'flowbite-vue'

defineProps<{
  message: string
}>()
</script>

<template>
  <FwbAlert
    v-if="message"
    data-testid="errorMessage"
    type="danger"
    role="alert"
    aria-live="assertive"
  >
    {{ message }}
  </FwbAlert>
</template>
