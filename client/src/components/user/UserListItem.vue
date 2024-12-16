
<script setup lang="ts">
import {ref} from 'vue'
import { FwbListGroupItem, FwbCheckbox } from 'flowbite-vue';



const { user } = defineProps<{
  user: UserPublic
}>()

const picked = ref()
</script>

<template>
     <FwbListGroupItem>
      <FwbCheckbox
        v-model="picked"
        label="Svelte"
        name="list-radio"
        :value="user.id"
      />
     </FwbListGroupItem>
</template>
<style scoped>

</style>