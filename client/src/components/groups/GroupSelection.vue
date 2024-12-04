<script setup lang="ts">
import { ref, computed } from 'vue'
import { FwbSelect } from 'flowbite-vue'
import { type GroupsPublic } from '@server/shared/types'

const { groups } = defineProps<{
  groups: GroupsPublic[],
  required: true
}>()

const selected = ref('')
const groupOptions = computed(() => groups.map((group) => ({ value: String(group.id), name: group.name })))
</script>

<template>
  <div>
    <FwbSelect
      v-model="selected"
      :options="groupOptions"
      label="Select group"
      placeholder="Groups"
      underline
    />
  </div>
</template>
<style scoped></style>
