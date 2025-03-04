<script setup lang="ts">
import { type PropType } from 'vue'
import { FwbDropdown, FwbListGroup, FwbListGroupItem, FwbAvatar } from 'flowbite-vue'
import type { GroupMember } from '@server/shared/types'

const { groupMembers, maxSelections } = defineProps<{
  groupMembers: GroupMember[]
  maxSelections?: number
}>()

const selectedMembers = defineModel('selectedMembers', {
  type: Array as PropType<number[]>,
  required: true,
})

const isMemberChecked = (member: GroupMember) => {
  return selectedMembers.value.some((selected) => selected === member.id)
}

const updateValue = (event: Event, member: GroupMember) => {
  const target = event.target as HTMLInputElement

  if (target.checked) {
    if (maxSelections && selectedMembers.value.length >= maxSelections) {
      selectedMembers.value = selectedMembers.value.slice(-maxSelections + 1)
    }
    selectedMembers.value.push(member.id)
  } else {
    selectedMembers.value = selectedMembers.value.filter((selected) => selected !== member.id)
  }
}
</script>

<template>
  <div>
    <FwbDropdown placement="bottom" text="Choose members">
      <FwbListGroup>
        <FwbListGroupItem v-for="member in groupMembers" :key="member.id" hover>
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              :value="member"
              :checked="isMemberChecked(member)"
              @change.prevent="(event) => updateValue(event, member)"
              class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
              :aria-label="'Select ' + member.username + ' as a member'"
              data-test="member-checkbox"
            />
            <span>
              <FwbAvatar :img="member.picture || undefined" rounded size="sm" />
            </span>
            <span class="text-sm text-gray-900">{{ member.username }}</span>
          </label>
        </FwbListGroupItem>
      </FwbListGroup>
    </FwbDropdown>
  </div>
</template>
