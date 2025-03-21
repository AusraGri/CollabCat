<script setup lang="ts">
import { computed } from 'vue'
import { useErrorStore } from '@/stores/errorStore'
import { FwbModal, FwbAvatar } from 'flowbite-vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import grumpy from '@/assets/grumpy.png'

const errorStore = useErrorStore()
const errorMessage = computed(() => errorStore.errorMessage)

function clearError() {
  errorStore.clearError()
}
</script>
<template>
  <FwbModal size="sm" position="center" v-if="errorMessage" @close="clearError" role="alertdialog">
    <template #header>
      <ExclamationTriangleIcon class="h-10 text-red-700" />
    </template>
    <template #body>
      <div>
        <p aria-label="Error message">{{ errorMessage }}</p>
      </div>
    </template>
    <template #footer>
      <div class="flex items-center space-x-2">
        <FwbAvatar
          :img="grumpy"
          rounded
          size="md"
          class="align-middle"
          data-test="error-avatar"
          aria-label="Grumpy Cat"
        />
        <p class="text-xs">If error persists please contact our staff</p>
      </div>
    </template>
  </FwbModal>
</template>
