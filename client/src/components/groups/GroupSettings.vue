<script setup lang="ts">
import { ref, watch, computed} from 'vue'
import { useUserGroupsStore } from '@/stores'
import { FwbCheckbox, FwbModal } from 'flowbite-vue'

const { isShowModal } = defineProps<{
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (event: 'create:group', value: string): void
  (event: 'close'): void
}>()


const userGroupStore = useUserGroupsStore()
const isPointsEnabled = ref(userGroupStore.isUserGroupPointsEnabled)
const isAdmin = computed(()=> userGroupStore.isAdmin)

function closeModal() {
  emit('close')
}

const handlePointChange = async (value: boolean) => {
    try {
        await userGroupStore.toggleMemberPointsStatus(value)
        isPointsEnabled.value = userGroupStore.isUserGroupPointsEnabled
    } catch (error) {
        console.log(error)
    }
}

watch(()=>userGroupStore.isUserGroupPointsEnabled,  (newValue)=>{
    isPointsEnabled.value = newValue
})
</script>

<template>
  <div>
    <FwbModal v-if="isShowModal" @close="closeModal">
      <template #header>
        <div>Manage {{ userGroupStore.activeGroup?.name }}</div>
      </template>
      <template #body>
        <div>
          <FwbCheckbox v-model="isPointsEnabled" label="My Group Task Points" @update:model-value="handlePointChange" />
        </div>
      </template>
    </FwbModal>
  </div>
</template>
<style scoped></style>
