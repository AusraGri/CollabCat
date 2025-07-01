<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserGroupsStore, usePointsStore, useCategoriesStore } from '@/stores'
import { FwbCheckbox, FwbModal, FwbButton } from 'flowbite-vue'
import ConfirmationModal from '../ConfirmationModal.vue'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import CategoriesManager from '../categories/CategoriesManager.vue'
import { setErrorMessage } from '@/utils/error'

const { isShowModal } = defineProps<{
  isShowModal: boolean
}>()

const emit = defineEmits<{
  (event: 'create:group', value: string): void
  (event: 'close'): void
}>()

const router = useRouter()
const userGroupStore = useUserGroupsStore()
const categoryStory = useCategoriesStore()
const pointStore = usePointsStore()
const isPointsEnabled = ref(pointStore.isPointsEnabled)
const isShowConfirmation = ref(false)
const isManageCategories = ref(false)
const isAdmin = computed(() => userGroupStore.isAdmin)
const groupName = computed(() => userGroupStore.activeGroup?.name)
const categories = computed(() => {
  const groupCategories = categoryStory.groupCategories || []

  if (isAdmin.value) return groupCategories

  return (
    groupCategories.filter((cat) => cat.createdByUserId === userGroupStore.userMembership?.id) || []
  )
})

const removeText = computed(() => {
  if (isAdmin.value) return 'Delete'

  return 'Leave'
})

const closeModal = () => {
  emit('close')
}

const handlePointChange = async () => {
  const groupId = userGroupStore.activeGroup?.id
  try {
    if (isPointsEnabled.value === pointStore.isPointsEnabled) return

    if (!groupId) throw new Error('Missing data for points managing')

    if (isPointsEnabled.value) {
      await pointStore.enablePoints(groupId)
    } else {
      await pointStore.disablePoints()
    }
  } catch (error) {
    setErrorMessage({ message: 'Failed to change user points status' })
  }
}

const saveChanges = async () => {
  await handlePointChange()

  emit('close')
}

const processConfirmation = async (confirm: boolean) => {
  isShowConfirmation.value = false

  if (!confirm) return

  if (confirm && isAdmin.value) {
    await userGroupStore.deleteGroup()
  } else if (confirm && !isAdmin.value) {
    await userGroupStore.removeUserFromGroup()
  }
  userGroupStore.activeGroup = null
  await userGroupStore.fetchUserGroups()
  emit('close')
  await router.push({ name: 'Profile' })
}

watch(
  () => pointStore.isEnabled,
  (newValue) => {
    isPointsEnabled.value = newValue
  }
)
</script>

<template>
  <div>
    <FwbModal v-if="isShowModal" @close="closeModal" aria-labelledby="group-settings-modal">
      <template #header>
        <h2
          class="text-lg font-semibold"
          id="group-settings-modal"
          data-test="group-settings-title"
        >
          Manage {{ groupName }}
        </h2>
      </template>
      <template #body>
        <div class="w-fit">
          <FwbCheckbox
            v-model="isPointsEnabled"
            label="My Group Task Points"
            :aria-label="`${groupName} points checkbox`"
          />
        </div>
        <div v-if="categories.length" class="mt-5">
          <FwbButton
            color="default"
            @click="isManageCategories = true"
            outline
            pill
            square
            :aria-label="`Manage categories for ${groupName}`"
            data-test="manage-categories-button"
          >
            Manage Your Categories
            <template #suffix>
              <div>
                <ChevronRightIcon class="w-5" />
              </div>
            </template>
          </FwbButton>
          <CategoriesManager
            :categories="categories"
            :is-show-categories="isManageCategories"
            @close="isManageCategories = false"
            data-test="categories-manager"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between">
          <div>
            <FwbButton
              color="red"
              @click="isShowConfirmation = true"
              :aria-label="`${removeText} group: ${groupName}`"
              data-test="remove-group-button"
              >{{ removeText }} this Group</FwbButton
            >
          </div>
          <div>
            <FwbButton
              form="userSettingsForm"
              color="green"
              @click="saveChanges"
              data-test="save-changes-button"
              :aria-label="`Save changes to the ${groupName} settings`"
            >
              Save Changes
            </FwbButton>
          </div>
        </div>
      </template>
    </FwbModal>
    <ConfirmationModal
      :action="removeText.toLowerCase()"
      :object="userGroupStore.activeGroup?.name"
      :is-show-modal="isShowConfirmation"
      @confirmed="processConfirmation"
      data-test="confirmation-modal"
    />
  </div>
</template>
